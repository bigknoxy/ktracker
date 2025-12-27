import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Exercise } from '../types';
import { apiService } from '../services/api';
import type { Workout, WorkoutForm } from '../types';
import { useFormAccessibility, useFocusVisible, useMotionPreference } from '../utils/accessibility';
import { performance } from '../utils/performance';

interface WorkoutFormProps {
  onSuccess: (workout: Workout) => void;
  onCancel: () => void;
}

const DRAFT_STORAGE_KEY = 'workoutform_draft';

const WorkoutForm: React.FC<WorkoutFormProps> = ({ onSuccess, onCancel }) => {
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState<Array<{
    exerciseId: number;
    sets: number;
    reps: number;
    weight: number;
  }>>([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [shouldPulse, setShouldPulse] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const exerciseRefs = useRef<(HTMLDivElement | null)[]>([]);
  const durationInputRef = useRef<HTMLInputElement>(null);

  const { showError, clearError } = useFormAccessibility();
  const isUsingKeyboard = useFocusVisible();
  const prefersReducedMotion = useMotionPreference();
  //const { showSuccess.*useToast();

  const today = new Date();
  const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
  const minDate = oneYearAgo.toISOString().split('T')[0];
  const maxDate = today.toISOString().split('T')[0];

  useEffect(() => {
    performance.metrics.measureRenderTime('WorkoutForm');
    loadExercises();
    loadDraft();
  }, []);

  const loadDraft = () => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (draft.duration) setDuration(draft.duration);
        if (draft.date) setDate(draft.date);
        if (draft.exercises && draft.exercises.length > 0) setExercises(draft.exercises);
        setDraftRestored(true);
        setTimeout(() => setDraftRestored(false), 3000);
      }
    } catch (err) {
      console.error('Failed to load draft:', err);
    }
  };

  const saveDraft = () => {
    try {
      const draft = { duration, date, exercises };
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

  const loadExercises = async () => {
    try {
      // For now, use hardcoded exercises since we don't have an exercises endpoint
      const defaultExercises: Exercise[] = [
        { id: 1, name: 'Bench Press', type: 'Chest' },
        { id: 2, name: 'Squat', type: 'Legs' },
        { id: 3, name: 'Deadlift', type: 'Back' },
        { id: 4, name: 'Overhead Press', type: 'Shoulders' },
        { id: 5, name: 'Barbell Row', type: 'Back' },
        { id: 6, name: 'Bicep Curl', type: 'Arms' },
        { id: 7, name: 'Tricep Extension', type: 'Arms' },
        { id: 8, name: 'Leg Press', type: 'Legs' },
        { id: 9, name: 'Lateral Raise', type: 'Shoulders' },
        { id: 10, name: 'Cable Row', type: 'Back' }
      ];
      setAvailableExercises(defaultExercises);
    } catch (err) {
      console.error('Failed to load exercises:', err);
    }
  };

  const addExercise = () => {
    setExercises([...exercises, {
      exerciseId: availableExercises[0]?.id || 1,
      sets: 0,
      reps: 0,
      weight: 0
    }]);
    saveDraft();
  };

  const removeExercise = (index: number) => {
    if (exercises.length <= 1) {
      showError('exercises-list', 'You must have at least one exercise');
      return;
    }
    setExercises(exercises.filter((_, i) => i !== index));
    saveDraft();
  };

  const updateExercise = (index: number, field: 'exerciseId' | 'sets' | 'reps' | 'weight', value: number) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
    clearError('exercises-list');
    saveDraft();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Clear previous errors
    clearError('duration-input');
    clearError('date-input');
    clearError('exercises-list');

    const durationValue = parseInt(duration);
    if (isNaN(durationValue) || durationValue <= 0) {
      showError('duration-input', 'Please enter a valid duration (greater than 0 minutes)');
      setIsSubmitting(false);
      if (durationInputRef.current) {
        durationInputRef.current.focus();
        durationInputRef.current.select();
      }
      return;
    }

    if (!date) {
      showError('date-input', 'Please select a date');
      setIsSubmitting(false);
      return;
    }

    if (exercises.length === 0) {
      showError('exercises-list', 'Please add at least one exercise');
      setIsSubmitting(false);
      return;
    }

    // Validate each exercise
    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i];
      if (exercise.sets <= 0 || exercise.reps <= 0) {
        showError('exercises-list', `Exercise ${i + 1} must have sets and reps greater than 0`);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const measure = performance.metrics.measureAPICall('POST /api/workouts');
      const isoDate = new Date(date).toISOString();
      const workoutData = {
        date: isoDate,
        duration: durationValue,
        exercises
      };

      const response = await apiService.addWorkout(workoutData);
      measure.end();

      if (response.data) {
        clearDraft();
        // Announce success to screen readers
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.position = 'absolute';
        announcer.style.left = '-10000px';
        announcer.style.width = '1px';
        announcer.style.height = '1px';
        announcer.style.overflow = 'hidden';
        announcer.textContent = `Workout added: ${durationValue} minutes with ${exercises.length} exercises on ${new Date(date).toLocaleDateString()}`;
        document.body.appendChild(announcer);
        setTimeout(() => announcer.remove(), 1000);

        setTimeout(() => {
          setShowSuccess(false);
          if (response.data) onSuccess(response.data);
        }, 1500);
      } else {
        setError(response.error || 'Failed to add workout');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
    setShouldPulse(fieldName);
    setTimeout(() => setShouldPulse(null), 400);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasInteracted(true);
    setDuration(e.target.value);
    clearError('duration-input');
    saveDraft();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    clearError('date-input');
    saveDraft();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleClear = () => {
    setDuration('');
    setDate(new Date().toISOString().split('T')[0]);
    setExercises([{
      exerciseId: availableExercises[0]?.id || 1,
      sets: 0,
      reps: 0,
      weight: 0
    }]);
    setError('');
    setHasInteracted(false);
    clearError('duration-input');
    clearError('date-input');
    clearError('exercises-list');
    clearDraft();
    if (durationInputRef.current) {
      durationInputRef.current.focus();
    }
  };

  // WCAG 2.1 AA compliant color contrast classes
  const getInputClasses = (hasError: boolean, isDateInput: boolean = false) => {
    const baseClasses = `
      w-full px-4 py-3 rounded-lg transition-all duration-300 ease-out
      focus:outline-none
      bg-white dark:bg-stone-700 text-stone-900 dark:text-white
      border-2 placeholder-stone-500 dark:placeholder-stone-400
      hover:border-forest-400 dark:hover:border-forest-500
      focus:border-forest-500 dark:focus:border-forest-400
      min-h-[48px] touch-manipulation
    `;

    if (hasError) {
      return `
        ${baseClasses}
        border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400
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

  const getExerciseInputClasses = (hasError: boolean = false) => {
    const baseClasses = `
      w-full px-3 py-2 rounded-lg transition-all duration-300 ease-out
      focus:outline-none
      bg-white dark:bg-stone-700 text-stone-900 dark:text-white
      border-2
      hover:border-forest-400 dark:hover:border-forest-500
      focus:border-forest-500 dark:focus:border-forest-400
      min-h-[48px] touch-manipulation
    `;

    if (hasError) {
      return `
        ${baseClasses}
        border-red-500 dark:border-red-400
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
      aria-labelledby="workout-form-title"
      aria-modal="true"
    >
      {showSuccess && (
        <div className="absolute inset-0 bg-white/95 dark:bg-stone-800/95 flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
              <div className={`absolute inset-0 rounded-full bg-forest-100 dark:bg-forest-900/30 ${!prefersReducedMotion ? 'animate-ping' : ''}`}></div>
              <div className="relative w-20 h-20 rounded-full bg-forest-500 dark:bg-forest-600 flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-xl font-semibold text-stone-900 dark:text-white mb-1">Success!</p>
            <p className="text-sm text-stone-600 dark:text-stone-400">Workout added</p>
          </div>
        </div>
      )}

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
          id="workout-form-title"
          className="text-lg font-semibold text-stone-900 dark:text-white tracking-tight"
        >
          Add Workout
        </h3>
        <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
          <span className="sr-only">Required fields</span>
          <span className="px-2 py-1 bg-forest-100 dark:bg-forest-900/30 text-forest-800 dark:text-forest-300 rounded-full font-medium">
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
        {/* Basic Workout Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="duration-input"
              className="block text-sm font-medium text-stone-700 dark:text-stone-200"
            >
              Duration <span className="text-red-500">*</span>
              <span className="ml-2 text-xs text-stone-500 dark:text-stone-400">
                (in minutes)
              </span>
            </label>
            <div className="relative group">
              <input
                ref={durationInputRef}
                type="number"
                id="duration-input"
                min="0"
                value={duration}
                onChange={handleDurationChange}
                onFocus={(e) => { e.preventDefault(); handleFocus('duration'); }}
                onBlur={handleBlur}
                className={`${getInputClasses(
                  hasInteracted && (isNaN(parseInt(duration)) || parseInt(duration) <= 0),
                  false
                )} ${focusedField === 'duration' && !prefersReducedMotion ? (shouldPulse === 'duration' ? 'animate-focus-ring-pulse-green' : 'animate-focus-ring-expand-green') : ''}`}
                placeholder="e.g., 45"
                required
                aria-required="true"
                aria-describedby="duration-help duration-error"
                aria-invalid={hasInteracted && (isNaN(parseInt(duration)) || parseInt(duration) <= 0)}
                style={{
                  ...(prefersReducedMotion ? { transition: 'none' } : {}),
                  outline: isUsingKeyboard && focusedField === 'duration' ? '2px solid #22c55e' : 'none',
                  outlineOffset: isUsingKeyboard && focusedField === 'duration' ? '2px' : '0'
                }}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-stone-400 text-sm font-medium">min</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p id="duration-help" className="text-xs text-stone-500 dark:text-stone-400">
                Enter workout duration in minutes. Must be greater than 0.
              </p>
              {hasInteracted && (isNaN(parseInt(duration)) || parseInt(duration) <= 0) && (
                <p id="duration-error" className="text-red-600 text-sm font-medium" role="alert" aria-live="polite">
                  Please enter a valid duration greater than 0
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
              className={`${getInputClasses(false, true)} ${focusedField === 'date' && !prefersReducedMotion ? (shouldPulse === 'date' ? 'animate-focus-ring-pulse-green' : 'animate-focus-ring-expand-green') : ''}`}
              required
              aria-required="true"
              aria-describedby="date-help date-error"
              style={{
                ...(prefersReducedMotion ? { transition: 'none' } : {}),
                outline: isUsingKeyboard && focusedField === 'date' ? '2px solid #22c55e' : 'none',
                outlineOffset: isUsingKeyboard && focusedField === 'date' ? '2px' : '0'
              }}
            />
            <div className="flex items-center justify-between">
              <p id="date-help" className="text-xs text-stone-500 dark:text-stone-400">
                Select date when you completed this workout.
              </p>
              {hasInteracted && !date && (
                <p id="date-error" className="text-red-600 text-sm font-medium" role="alert" aria-live="polite">
                  Please select a date
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Exercises Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <label
                htmlFor="exercises-list"
                className="block text-sm font-medium text-stone-700 dark:text-stone-200"
              >
                Exercises <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Add each exercise with sets, reps, and weight used.
              </p>
            </div>
            <button
              type="button"
              onClick={addExercise}
              className="group flex items-center space-x-2 bg-forest-50 dark:bg-forest-900/20 hover:bg-forest-100 dark:hover:bg-forest-900/30 text-forest-700 dark:text-forest-300 px-3 py-2 rounded-lg border border-forest-200 dark:border-forest-800 transition-all duration-300 ease-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-forest-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-stone-800"
              aria-label="Add exercise to workout"
              style={{
                ...(prefersReducedMotion ? { transition: 'none' } : {}),
                outline: isUsingKeyboard ? '2px solid #22c55e' : 'none',
                outlineOffset: isUsingKeyboard ? '2px' : '0'
              }}
            >
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm font-medium">Add Exercise</span>
            </button>
          </div>

          <div
            id="exercises-list"
            className="space-y-4"
            role="region"
            aria-label="Exercise list"
            aria-describedby="exercises-help"
          >
            {exercises.map((exercise, index) => (
              <div
                key={index}
                ref={el => {
                  exerciseRefs.current[index] = el;
                  return;
                }}
                className={`bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 p-4 rounded-xl border-2 transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1 ${
                  isUsingKeyboard ? 'ring-2 ring-green-500/30' : ''
                }`}
                style={{
                  ...(prefersReducedMotion ? { transition: 'none' } : {}),
                  outline: isUsingKeyboard ? '2px solid #22c55e' : 'none',
                  outlineOffset: isUsingKeyboard ? '2px' : '0'
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                  {/* Exercise Selection */}
                  <div className="space-y-1">
                    <label
                      htmlFor={`exercise-${index}`}
                      className="block text-xs font-medium text-forest-600 dark:text-forest-400"
                    >
                      Exercise <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <select
                        id={`exercise-${index}`}
                        value={exercise.exerciseId}
                        onChange={(e) => updateExercise(index, 'exerciseId', parseInt(e.target.value))}
                        onFocus={(e) => { e.preventDefault(); handleFocus('exercise'); }}
                        onBlur={handleBlur}
                        className={`appearance-none ${getExerciseInputClasses()} ${focusedField === 'exercise' && !prefersReducedMotion ? (shouldPulse === 'exercise' ? 'animate-focus-ring-pulse-green' : 'animate-focus-ring-expand-green') : ''} pr-10`}
                        aria-required="true"
                        aria-describedby={`exercise-${index}-help`}
                        style={{
                          ...(prefersReducedMotion ? { transition: 'none' } : {}),
                          outline: isUsingKeyboard && focusedField === 'exercise' ? '2px solid #22c55e' : 'none',
                          outlineOffset: isUsingKeyboard && focusedField === 'exercise' ? '2px' : '0'
                        }}
                      >
                        {availableExercises.map((ex) => (
                          <option key={ex.id} value={ex.id}>
                            {ex.name} ({ex.type})
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-stone-500 dark:text-stone-400 transition-transform duration-300 group-hover:translate-y-0.5" />
                      </div>
                    </div>
                    <p id={`exercise-${index}-help`} className="text-xs text-stone-500 dark:text-stone-400">
                      Select an exercise from list
                    </p>
                  </div>

                  {/* Sets */}
                  <div className="space-y-1">
                    <label
                      htmlFor={`sets-${index}`}
                      className="block text-xs font-medium text-forest-600 dark:text-forest-400"
                    >
                      Sets <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`sets-${index}`}
                      type="number"
                      min="0"
                      value={exercise.sets}
                      onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value))}
                      onFocus={(e) => { e.preventDefault(); handleFocus('exercise'); }}
                      onBlur={handleBlur}
                      className={`${getExerciseInputClasses()} ${focusedField === 'exercise' && !prefersReducedMotion ? (shouldPulse === 'exercise' ? 'animate-focus-ring-pulse-green' : 'animate-focus-ring-expand-green') : ''}`}
                      aria-required="true"
                      aria-describedby={`sets-${index}-help`}
                      style={{
                        ...(prefersReducedMotion ? { transition: 'none' } : {}),
                        outline: isUsingKeyboard && focusedField === 'exercise' ? '2px solid #22c55e' : 'none',
                      outlineOffset: isUsingKeyboard && focusedField === 'exercise' ? '2px' : '0'
                    }}
                    />
                    <p id={`reps-${index}-help`} className="text-xs text-stone-500 dark:text-stone-400">
                      Reps per set
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor={`weight-${index}`}
                      className="block text-xs font-medium text-forest-600 dark:text-forest-400"
                    >
                      Weight (lbs)
                    </label>
                    <input
                      id={`reps-${index}`}
                      type="number"
                      min="0"
                      value={exercise.reps}
                      onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value))}
                      onFocus={(e) => { e.preventDefault(); handleFocus('exercise'); }}
                      onBlur={handleBlur}
                      className={`${getExerciseInputClasses()} ${focusedField === 'exercise' && !prefersReducedMotion ? (shouldPulse === 'exercise' ? 'animate-focus-ring-pulse-green' : 'animate-focus-ring-expand-green') : ''}`}
                      aria-required="true"
                      aria-describedby={`reps-${index}-help`}
                      style={{
                        ...(prefersReducedMotion ? { transition: 'none' } : {}),
                        outline: isUsingKeyboard && focusedField === 'exercise' ? '2px solid #22c55e' : 'none',
                        outlineOffset: isUsingKeyboard && focusedField === 'exercise' ? '2px' : '0'
                      }}
                    />
                    <p id={`reps-${index}-help`} className="text-xs text-gray-500 dark:text-gray-400">
                      Reps per set
                    </p>
                  </div>

                  {/* Weight */}
                  <div className="space-y-1">
                    <label
                      htmlFor={`weight-${index}`}
                      className="block text-xs font-medium text-green-600 dark:text-green-400"
                    >
                      Weight (lbs)
                    </label>
                    <div className="relative">
                      <input
                        id={`weight-${index}`}
                        type="number"
                        step="2.5"
                        min="0"
                        value={exercise.weight}
                        onChange={(e) => updateExercise(index, 'weight', parseFloat(e.target.value))}
                        onFocus={(e) => { e.preventDefault(); handleFocus('exercise'); }}
                        onBlur={handleBlur}
                        className={`${getExerciseInputClasses()} ${focusedField === 'exercise' && !prefersReducedMotion ? (shouldPulse === 'exercise' ? 'animate-focus-ring-pulse-green' : 'animate-focus-ring-expand-green') : ''}`}
                        aria-describedby={`weight-${index}-help`}
                        style={{
                          ...(prefersReducedMotion ? { transition: 'none' } : {}),
                          outline: isUsingKeyboard && focusedField === 'exercise' ? '2px solid #22c55e' : 'none',
                          outlineOffset: isUsingKeyboard && focusedField === 'exercise' ? '2px' : '0'
                        }}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <span className="text-stone-400 text-xs">lbs</span>
                      </div>
                    </div>
                    <p id={`weight-${index}-help`} className="text-xs text-stone-500 dark:text-stone-400">
                      Weight used for this exercise
                    </p>
                  </div>
                </div>

                {/* Exercise Actions */}
                <div className="flex justify-between items-center pt-2 border-t border-forest-100 dark:border-stone-600">
                  <div className="flex items-center space-x-2 text-forest-600 dark:text-forest-400 text-xs font-medium">
                    <span className="bg-white dark:bg-stone-800 px-2 py-1 rounded-full shadow-sm border border-forest-200 dark:border-stone-600">
                      Exercise {index + 1}
                    </span>
                    {exercise.sets > 0 && exercise.reps > 0 && (
                      <span className="bg-white dark:bg-stone-800 px-2 py-1 rounded-full shadow-sm border border-forest-200 dark:border-stone-600">
                        {exercise.sets} × {exercise.reps} reps
                      </span>
                    )}
                    {exercise.weight > 0 && (
                      <span className="bg-white dark:bg-stone-800 px-2 py-1 rounded-full shadow-sm border border-forest-200 dark:border-stone-600">
                        {exercise.weight} lbs
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => removeExercise(index)}
                      disabled={exercises.length <= 1}
                      className="group flex items-center space-x-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-800 transition-all duration-300 ease-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                      aria-label={`Remove exercise ${index + 1}`}
                      style={{
                        ...(prefersReducedMotion ? { transition: 'none' } : {}),
                        outline: isUsingKeyboard ? '2px solid #ef4444' : 'none',
                        outlineOffset: isUsingKeyboard ? '2px' : '0'
                      }}
                    >
                      <svg className="w-3 h-3 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="text-xs font-medium">Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {exercises.length === 0 && (
              <div
                className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 border-2 border-dashed border-green-300 dark:border-gray-600 rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg"
                role="status"
                aria-live="polite"
              >
                <div className="text-green-600 dark:text-green-400 mb-2 flex justify-center">
                  <svg className="w-8 h-8 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No exercises added yet. Click "Add Exercise" to start building your workout.
                </p>
              </div>
            )}

            {/* Exercises Error Message */}
            {error && error.includes('exercise') && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 transition-all duration-300 animate-in slide-in-from-top-2 duration-300 animate-shake" role="alert" aria-live="assertive">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="text-base font-semibold text-red-800 dark:text-red-400">Exercise Error</h4>
                    <p className="text-base text-red-700 dark:text-red-300 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
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
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Clear</span>
            </span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="group bg-white dark:bg-stone-700 py-3 px-4 border-2 border-stone-300 dark:border-stone-600 rounded-lg shadow-sm text-sm font-medium text-stone-700 dark:text-stone-200 transition-all duration-300 ease-out hover:scale-105 active:scale-95 hover:bg-stone-50 dark:hover:bg-stone-600 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-stone-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            aria-label="Cancel workout entry"
            disabled={isSubmitting}
            style={{
              ...(prefersReducedMotion ? { transition: 'none' } : {}),
              outline: isUsingKeyboard ? '2px solid #3b82f6' : 'none',
              outlineOffset: isUsingKeyboard ? '2px' : '0'
            }}
          >
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Cancel</span>
            </span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`group relative bg-gradient-to-r from-forest-600 to-forest-700 py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white transition-all duration-300 ease-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-forest-500 focus:ring-offset-white dark:focus:ring-offset-stone-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${
              isSubmitting ? 'opacity-75 cursor-wait' : ''
            }`}
            aria-label={isSubmitting ? 'Adding workout...' : 'Add workout'}
            aria-busy={isSubmitting}
            style={{
              ...(prefersReducedMotion ? { transition: 'none' } : {}),
              outline: isUsingKeyboard ? '2px solid #22c55e' : 'none',
              outlineOffset: isUsingKeyboard ? '2px' : '0'
            }}
          >
            <span className="flex items-center justify-center space-x-2">
              <svg className={`w-4 h-4 transition-opacity duration-300 ${isSubmitting ? 'opacity-100' : 'opacity-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{isSubmitting ? 'Adding...' : 'Add Workout'}</span>
              {!isSubmitting && (
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Global Error Message */}
        {error && !error.includes('exercise') && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 transition-all duration-300 animate-in slide-in-from-top-2 duration-300 animate-shake" role="alert" aria-live="assertive">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="text-base font-semibold text-red-800 dark:text-red-400">Error</h4>
                <p className="text-base text-red-700 dark:text-red-300 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default WorkoutForm;
