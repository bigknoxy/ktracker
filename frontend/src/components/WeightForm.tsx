import React, { useState, useRef, useEffect } from 'react';
import { apiService } from '../services/api';
import type { WeightEntry } from '../types';
import { useFormAccessibility, useFocusVisible, useMotionPreference } from '../utils/accessibility';
import { performance } from '../utils/performance';
import { useToast } from '../hooks/useToast';

interface WeightFormProps {
  onSuccess: (entry: WeightEntry) => void;
  onCancel: () => void;
}

const DRAFT_STORAGE_KEY = 'weightform_draft';

const WeightForm: React.FC<WeightFormProps> = ({ onSuccess, onCancel }) => {
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [shouldPulse, setShouldPulse] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const weightInputRef = useRef<HTMLInputElement>(null);

  const { showError, clearError } = useFormAccessibility();
  const isUsingKeyboard = useFocusVisible();
  const prefersReducedMotion = useMotionPreference();
  const { showSuccess, showToastError } = useToast();

  const today = new Date();
  const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
  const minDate = oneYearAgo.toISOString().split('T')[0];
  const maxDate = today.toISOString().split('T')[0];

  useEffect(() => {
    performance.metrics.measureRenderTime('WeightForm');
    loadDraft();
  }, []);

  const loadDraft = () => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (draft.weight) setWeight(draft.weight);
        if (draft.date) setDate(draft.date);
        setDraftRestored(true);
        setTimeout(() => setDraftRestored(false), 3000);
      }
    } catch (err) {
      console.error('Failed to load draft:', err);
    }
  };

  const saveDraft = () => {
    try {
      const draft = { weight, date };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (err) {
      console.error('Failed to save draft:', err);
    }
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear draft:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const weightValue = parseFloat(weight);
    const weightInput = weightInputRef.current;

    clearError('weight-input');
    clearError('date-input');

    if (isNaN(weightValue) || weightValue <= 0) {
      showError('weight-input', 'Please enter a valid weight (greater than 0)');
      setIsSubmitting(false);
      if (weightInput) {
        weightInput.focus();
        weightInput.select();
      }
      return;
    }

    if (!date) {
      showError('date-input', 'Please select a date');
      setIsSubmitting(false);
      return;
    }

    try {
      const measure = performance.metrics.measureAPICall('POST /api/weight');
      const isoDate = new Date(date).toISOString();
      const response = await apiService.addWeightEntry(weightValue, isoDate);
      measure.end();

      if (response.data) {
        clearDraft();
        showSuccess(`Weight entry added: ${weightValue} lbs on ${new Date(date).toLocaleDateString()}`, { duration: 4000 });
        if (response.data) onSuccess(response.data);
      } else {
        showToastError(response.error || 'Failed to add weight entry', { duration: 5000 });
      }
    } catch {
      showToastError('An unexpected error occurred. Please try again.', { duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasInteracted(true);
    setWeight(e.target.value);
    clearError('weight-input');
    saveDraft();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    clearError('date-input');
    saveDraft();
  };

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
    setShouldPulse(fieldName);
    setTimeout(() => setShouldPulse(null), 400);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleClear = () => {
    setWeight('');
    setDate(new Date().toISOString().split('T')[0]);
    setHasInteracted(false);
    clearError('weight-input');
    clearError('date-input');
    clearDraft();
    if (weightInputRef.current) {
      weightInputRef.current.focus();
    }
  };

  const getInputClasses = (hasError: boolean, isDateInput: boolean = false) => {
    const baseClasses = `
      w-full px-4 py-3 rounded-lg transition-all duration-300 ease-out
      focus:outline-none
      bg-white dark:bg-stone-700 text-stone-900 dark:text-white
      border-2 placeholder-stone-500 dark:placeholder-stone-400
      hover:border-sage-400 dark:hover:border-sage-500
      focus:border-sage-500 dark:focus:border-sage-400
      min-h-[48px] touch-manipulation
    `;

    if (hasError) {
      return `
        ${baseClasses}
        border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400
        focus:ring-red-500 focus:ring-offset-white dark:focus:ring-offset-stone-800
        shadow-lg shadow-red-500/10
      `;
    } else if (isDateInput) {
      return `
        ${baseClasses}
        border-stone-300 dark:border-stone-600
      `;
    } else {
      return `
        ${baseClasses}
        border-stone-300 dark:border-stone-600
      `;
    }
  };

  return (
    <div
      className="bg-white dark:bg-stone-800 p-6 rounded-lg shadow-lg transition-all duration-300 ease-out hover:shadow-xl border border-stone-100 dark:border-stone-700 relative overflow-hidden"
      role="dialog"
      aria-labelledby="weight-form-title"
      aria-modal="true"
    >

      {draftRestored && (
        <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300" role="status" aria-live="polite">
          <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">Draft restored from previous session</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3
          id="weight-form-title"
          className="text-lg font-semibold text-stone-900 dark:text-white tracking-tight"
        >
          Add Weight Entry
        </h3>
        <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
          <span className="sr-only">Required fields</span>
          <span className="px-2 py-1 bg-sage-100 dark:bg-sage-900/30 text-sage-800 dark:text-sage-300 rounded-full font-medium">
            *
          </span>
        </div>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="space-y-6"
        noValidate
      >
        <div className="space-y-2">
          <label
            htmlFor="weight-input"
            className="block text-sm font-medium text-stone-700 dark:text-stone-200"
          >
            Weight <span className="text-red-500">*</span>
            <span className="ml-2 text-xs text-stone-500 dark:text-stone-400">
              (in pounds)
            </span>
          </label>
          <div className="relative group">
            <input
              ref={weightInputRef}
              type="number"
              id="weight-input"
              step="0.1"
              min="0"
              value={weight}
              onChange={handleWeightChange}
              onFocus={(e) => { e.preventDefault(); handleFocus('weight'); }}
              onBlur={handleBlur}
              className={`${getInputClasses(
                hasInteracted && (isNaN(parseFloat(weight)) || parseFloat(weight) <= 0)
              )} ${focusedField === 'weight' && !prefersReducedMotion ? (shouldPulse === 'weight' ? 'animate-focus-ring-pulse' : 'animate-focus-ring-expand') : ''}`}
              placeholder="e.g., 150.5"
              required
              aria-required="true"
              aria-describedby="weight-help weight-error"
              aria-invalid={hasInteracted && (isNaN(parseFloat(weight)) || parseFloat(weight) <= 0)}
              style={{
                ...(prefersReducedMotion ? { transition: 'none' } : {}),
                outline: isUsingKeyboard && focusedField === 'weight' ? '2px solid #6366f1' : 'none',
                outlineOffset: isUsingKeyboard && focusedField === 'weight' ? '2px' : '0'
              }}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-stone-400 text-sm font-medium">lbs</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p id="weight-help" className="text-xs text-stone-500 dark:text-stone-400">
              Enter your weight in pounds. Use decimal points for precision.
            </p>
            {hasInteracted && (isNaN(parseFloat(weight)) || parseFloat(weight) <= 0) && (
              <p id="weight-error" className="text-red-600 text-sm font-medium" role="alert" aria-live="polite">
                Please enter a valid weight greater than 0
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="date-input"
            className="block text-sm font-medium text-stone-700 dark:text-stone-200"
          >
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="date-input"
            value={date}
            onChange={handleDateChange}
            onFocus={(e) => { e.preventDefault(); handleFocus('date'); }}
            onBlur={handleBlur}
            min={minDate}
            max={maxDate}
            className={`${getInputClasses(false, true)} ${focusedField === 'date' && !prefersReducedMotion ? (shouldPulse === 'date' ? 'animate-focus-ring-pulse' : 'animate-focus-ring-expand') : ''}`}
            required
            aria-required="true"
            aria-describedby="date-help date-error"
            style={{
              ...(prefersReducedMotion ? { transition: 'none' } : {}),
              outline: isUsingKeyboard && focusedField === 'date' ? '2px solid #6366f1' : 'none',
              outlineOffset: isUsingKeyboard && focusedField === 'date' ? '2px' : '0'
            }}
          />
            <div className="flex items-center justify-between">
              <p id="date-help" className="text-xs text-stone-500 dark:text-stone-400">
                Select date when you measured your weight.
              </p>
            {hasInteracted && !date && (
              <p id="date-error" className="text-red-600 text-sm font-medium" role="alert" aria-live="polite">
                Please select a date
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
          <button
            type="button"
            onClick={handleClear}
            className="group bg-stone-100 dark:bg-stone-700 py-3 px-4 border-2 border-stone-300 dark:border-stone-600 rounded-lg shadow-sm text-sm font-medium text-stone-700 dark:text-stone-200 transition-all duration-300 ease-out hover:scale-105 active:scale-95 hover:bg-stone-200 dark:hover:bg-stone-600 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-stone-500 focus:ring-offset-white dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            aria-label="Clear form"
            disabled={isSubmitting}
            style={{
              ...(prefersReducedMotion ? { transition: 'none' } : {}),
              outline: isUsingKeyboard ? '2px solid #78716c' : 'none',
              outlineOffset: isUsingKeyboard ? '2px' : '0'
            }}
          >
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Clear</span>
            </span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="group bg-white dark:bg-stone-700 py-3 px-4 border-2 border-stone-300 dark:border-stone-600 rounded-lg shadow-sm text-sm font-medium text-stone-700 dark:text-stone-200 transition-all duration-300 ease-out hover:scale-105 active:scale-95 hover:bg-stone-50 dark:hover:bg-stone-600 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-stone-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            aria-label="Cancel weight entry"
            disabled={isSubmitting}
            style={{
              ...(prefersReducedMotion ? { transition: 'none' } : {}),
              outline: isUsingKeyboard ? '2px solid #3b82f6' : 'none',
              outlineOffset: isUsingKeyboard ? '2px' : '0'
            }}
          >
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Cancel</span>
            </span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`group relative bg-gradient-to-r from-sage-600 to-sage-700 py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white transition-all duration-300 ease-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-sage-500 focus:ring-offset-white dark:focus:ring-offset-stone-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${
              isSubmitting ? 'opacity-75 cursor-wait' : ''
            }`}
            aria-label={isSubmitting ? 'Adding weight entry...' : 'Add weight entry'}
            aria-busy={isSubmitting}
            style={{
              ...(prefersReducedMotion ? { transition: 'none' } : {}),
              outline: isUsingKeyboard ? '2px solid #4da78a' : 'none',
              outlineOffset: isUsingKeyboard ? '2px' : '0'
            }}
          >
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Cancel</span>
            </span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`group relative bg-gradient-to-r from-indigo-600 to-purple-600 py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white transition-all duration-300 ease-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${
              isSubmitting ? 'opacity-75 cursor-wait' : ''
            }`}
            aria-label={isSubmitting ? 'Adding weight entry...' : 'Add weight entry'}
            aria-busy={isSubmitting}
            style={{
              ...(prefersReducedMotion ? { transition: 'none' } : {}),
              outline: isUsingKeyboard ? '2px solid #3b82f6' : 'none',
              outlineOffset: isUsingKeyboard ? '2px' : '0'
            }}
          >
            <span className="flex items-center justify-center space-x-2">
              <svg className={`w-4 h-4 transition-opacity duration-300 ${isSubmitting ? 'opacity-100' : 'opacity-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{isSubmitting ? 'Adding...' : 'Add Entry'}</span>
              {!isSubmitting && (
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </span>
            {isSubmitting && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WeightForm;
