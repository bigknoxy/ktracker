import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { apiService } from '../services/api';
import type { Task, TaskForm } from '../types';
import { useFormAccessibility, useFocusVisible, useMotionPreference } from '../utils/accessibility';
import { performance } from '../utils/performance';
// //import { useToast } from '.

interface TaskFormProps {
  onSuccess: (task: Task) => void;
  onCancel: () => void;
}

const DRAFT_STORAGE_KEY = 'taskform_draft';

const TaskForm: React.FC<TaskFormProps> = ({ onSuccess, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [shouldPulse, setShouldPulse] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const { showError, clearError } = useFormAccessibility();
  const isUsingKeyboard = useFocusVisible();
  const prefersReducedMotion = useMotionPreference();
  // //const { showSuccess.*useToast();

  const today = new Date();
  const oneYearFuture = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  const minDate = today.toISOString().split('T')[0];
  const maxDate = oneYearFuture.toISOString().split('T')[0];

  useEffect(() => {
    performance.metrics.measureRenderTime('TaskForm');
    loadDraft();
  }, []);

  const loadDraft = () => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (draft.title) setTitle(draft.title);
        if (draft.description) setDescription(draft.description);
        if (draft.dueDate) setDueDate(draft.dueDate);
        if (draft.priority) setPriority(draft.priority);
        setDraftRestored(true);
        setTimeout(() => setDraftRestored(false), 3000);
      }
    } catch (err) {
      console.error('Failed to load draft:', err);
    }
  };

  const saveDraft = () => {
    try {
      const draft = { title, description, dueDate, priority };
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

    clearError('title-input');
    clearError('date-input');

    if (!title.trim()) {
      showError('title-input', 'Please enter a task title');
      setIsSubmitting(false);
      if (titleInputRef.current) {
        titleInputRef.current.focus();
        titleInputRef.current.select();
      }
      return;
    }

    try {
      const measure = performance.metrics.measureAPICall('POST /api/tasks');
      const isoDueDate = dueDate ? new Date(dueDate).toISOString() : undefined;
      const taskData: TaskForm = {
        title: title.trim(),
        description: description.trim(),
        dueDate: isoDueDate,
        priority
      };

      const response = await apiService.addTask(taskData);
      measure.end();

      if (response.data) {
        clearDraft();
        // showSuccessToast(`Task "${title.trim()}" created with ${priority} priority`, { duration: 4000 });
        if (response.data) onSuccess(response.data);
      } else {
        // showToastError(response.error || 'Failed to add task', { duration: 5000 });
      }
    } catch {
      // showToastError('An unexpected error occurred. Please try again.', { duration: 5000 });
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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasInteracted(true);
    setTitle(e.target.value);
    clearError('title-input');
    saveDraft();
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    saveDraft();
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriority(e.target.value as 'low' | 'medium' | 'high');
    saveDraft();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDueDate(e.target.value);
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
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
    setHasInteracted(false);
    clearError('title-input');
    clearError('date-input');
    clearDraft();
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  };

  // WCAG 2.1 AA compliant color contrast classes
  const getInputClasses = (hasError: boolean, field: string = '') => {
    const baseClasses = `
      w-full px-4 py-3 rounded-lg transition-all duration-300 ease-out
      focus:outline-none
      bg-white dark:bg-stone-700 text-stone-900 dark:text-white
      border-2 placeholder-stone-500 dark:placeholder-stone-400
      hover:border-clay-400 dark:hover:border-clay-500
      focus:border-clay-500 dark:focus:border-clay-400
      min-h-[48px] touch-manipulation
    `;

    if (hasError) {
      return `
        ${baseClasses}
        border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400
        shadow-lg shadow-red-500/10
      `;
    } else if (field === 'description') {
      return `
        ${baseClasses}
        border-stone-300 dark:border-stone-600
        min-h-[120px]
      `;
    } else {
      return `
        ${baseClasses}
        border-stone-300 dark:border-stone-600
      `;
    }
  };

  const getSelectClasses = () => {
    return `
      w-full px-4 py-3 rounded-lg transition-all duration-300 ease-out
      focus:outline-none
      bg-white dark:bg-stone-700 text-stone-900 dark:text-white
      border-2 border-stone-300 dark:border-stone-600
      hover:border-clay-400 dark:hover:border-clay-500
      focus:border-clay-500 dark:focus:border-clay-400
      min-h-[48px] touch-manipulation
    `;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', border: 'border-red-200 dark:border-red-800' };
      case 'medium': return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800' };
      case 'low': return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', border: 'border-green-200 dark:border-green-800' };
      default: return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-600' };
    }
  };

  return (
    <div
      className="bg-white dark:bg-stone-800 p-6 rounded-lg shadow-lg transition-all duration-300 ease-out hover:shadow-xl border border-stone-100 dark:border-stone-700 relative overflow-hidden"
      role="dialog"
      aria-labelledby="task-form-title"
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
          id="task-form-title"
          className="text-lg font-semibold text-stone-900 dark:text-white tracking-tight"
        >
          Create Task
        </h3>
        <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
          <span className="sr-only">Required fields</span>
          <span className="px-2 py-1 bg-clay-100 dark:bg-clay-900/30 text-clay-800 dark:text-clay-300 rounded-full font-medium">
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
        {/* Task Title */}
        <div className="space-y-2">
          <label
            htmlFor="title-input"
            className="block text-sm font-medium text-stone-700 dark:text-stone-200"
          >
            Task Title <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <input
              ref={titleInputRef}
              type="text"
              id="title-input"
              value={title}
              onChange={handleTitleChange}
              onFocus={(e) => { e.preventDefault(); handleFocus('title'); }}
              onBlur={handleBlur}
              className={`${getInputClasses(
                hasInteracted && !title.trim()
              )} ${focusedField === 'title' && !prefersReducedMotion ? (shouldPulse === 'title' ? 'animate-focus-ring-pulse-purple' : 'animate-focus-ring-expand-purple') : ''}`}
              placeholder="Enter task title..."
              required
              aria-required="true"
              aria-describedby="title-help title-error"
              aria-invalid={hasInteracted && !title.trim()}
              style={{
                ...(prefersReducedMotion ? { transition: 'none' } : {}),
                outline: isUsingKeyboard && focusedField === 'title' ? '2px solid #a855f7' : 'none',
              outlineOffset: isUsingKeyboard && focusedField === 'title' ? '2px' : '0'
            }}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-stone-400 text-sm font-medium" aria-hidden="true">📝</span>
            </div>
          </div>
           <div className="space-y-2">
             <div className="flex items-center justify-between">
               <p id="title-help" className="text-xs text-stone-500 dark:text-stone-400">
                 Enter a clear, descriptive title for your task.
               </p>
               <span className="text-xs font-medium text-stone-600 dark:text-stone-300">
                 {title.length}/100
               </span>
             </div>
             <div className="relative h-2 bg-stone-200 dark:bg-stone-600 rounded-full overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full transition-all duration-300 ease-out ${
                  title.length <= 50 ? 'bg-green-500' :
                  title.length <= 80 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{
                  width: `${Math.min((title.length / 100) * 100, 100)}%`,
                  transition: prefersReducedMotion ? 'none' : 'width 300ms ease-out'
                }}
                role="progressbar"
                aria-valuenow={title.length}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Title character count progress"
              />
            </div>
            {hasInteracted && !title.trim() && (
              <p id="title-error" className="text-red-600 text-sm font-medium" role="alert" aria-live="polite">
                Please enter a task title
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label
            htmlFor="description-input"
            className="block text-sm font-medium text-stone-700 dark:text-stone-200"
          >
            Description
          </label>
          <textarea
            id="description-input"
            rows={4}
            value={description}
            onChange={handleDescriptionChange}
            onFocus={(e) => { e.preventDefault(); handleFocus('description'); }}
            onBlur={handleBlur}
            className={`${getInputClasses(false, 'description')} ${focusedField === 'description' && !prefersReducedMotion ? (shouldPulse === 'description' ? 'animate-focus-ring-pulse-purple' : 'animate-focus-ring-expand-purple') : ''}`}
            placeholder="Describe this task in detail..."
            aria-describedby="description-help"
            style={{
              ...(prefersReducedMotion ? { transition: 'none' } : {}),
              outline: isUsingKeyboard && focusedField === 'description' ? '2px solid #a855f7' : 'none',
              outlineOffset: isUsingKeyboard && focusedField === 'description' ? '2px' : '0'
            }}
            />
            <p id="description-help" className="text-xs text-stone-500 dark:text-stone-400">
              Optional details about task, steps to complete, or additional context.
            </p>
          </div>

        {/* Task Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Due Date */}
          <div className="space-y-2">
            <label
              htmlFor="date-input"
              className="block text-sm font-medium text-stone-700 dark:text-stone-200"
            >
              Due Date
            </label>
            <input
              type="date"
              id="date-input"
              value={dueDate}
              onChange={handleDateChange}
              onFocus={(e) => { e.preventDefault(); handleFocus('dueDate'); }}
              onBlur={handleBlur}
              min={minDate}
              max={maxDate}
              className={`${getInputClasses(false)} ${focusedField === 'dueDate' && !prefersReducedMotion ? (shouldPulse === 'dueDate' ? 'animate-focus-ring-pulse-purple' : 'animate-focus-ring-expand-purple') : ''}`}
              aria-describedby="date-help date-error"
              style={{
                ...(prefersReducedMotion ? { transition: 'none' } : {}),
                outline: isUsingKeyboard && focusedField === 'dueDate' ? '2px solid #a855f7' : 'none',
                outlineOffset: isUsingKeyboard && focusedField === 'dueDate' ? '2px' : '0'
              }}
            />
            <div className="flex items-center justify-between">
              <p id="date-help" className="text-xs text-stone-500 dark:text-stone-400">
                Set a deadline for this task.
              </p>
              {hasInteracted && dueDate && new Date(dueDate) < new Date() && (
                <p id="date-error" className="text-red-600 text-sm font-medium" role="alert" aria-live="polite">
                  Due date is in the past
                </p>
              )}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label
              htmlFor="priority-input"
              className="block text-sm font-medium text-stone-700 dark:text-stone-200"
            >
              Priority <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <select
                id="priority-input"
                value={priority}
                onChange={handlePriorityChange}
                onFocus={(e) => { e.preventDefault(); handleFocus('priority'); }}
                onBlur={handleBlur}
                className={`appearance-none ${getSelectClasses()} ${focusedField === 'priority' && !prefersReducedMotion ? (shouldPulse === 'priority' ? 'animate-focus-ring-pulse-purple' : 'animate-focus-ring-expand-purple') : ''} pr-10`}
                aria-required="true"
                aria-describedby="priority-help"
                style={{
                  ...(prefersReducedMotion ? { transition: 'none' } : {}),
                  outline: isUsingKeyboard && focusedField === 'priority' ? '2px solid #a855f7' : 'none',
                  outlineOffset: isUsingKeyboard && focusedField === 'priority' ? '2px' : '0'
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-stone-500 dark:text-stone-400 transition-transform duration-300 group-hover:translate-y-0.5" />
              </div>
            </div>
            <p id="priority-help" className="text-xs text-stone-500 dark:text-stone-400">
              Set priority level to help organize your tasks.
            </p>
          </div>
        </div>

        {/* Task Summary */}
        <div className="bg-gradient-to-r from-clay-50 to-amber-50 dark:from-stone-700 dark:to-stone-800 border-2 border-clay-100 dark:border-stone-600 rounded-lg p-4 transition-all duration-300 ease-out hover:shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
             <div className="flex items-center space-x-4">
               <div className="flex items-center space-x-2">
                 <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">Priority:</span>
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                    getPriorityColor(priority).bg
                  } ${
                    getPriorityColor(priority).text
                  } ${
                    getPriorityColor(priority).border
                  }`}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  <span className="ml-1.5 text-xs opacity-75">
                    {priority === 'high' && '🔥'}
                    {priority === 'medium' && '⚡'}
                    {priority === 'low' && '🌿'}
                  </span>
                </span>
              </div>

               <div className="flex items-center space-x-2">
                 <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">Title length:</span>
                 <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-stone-600 text-clay-600 dark:text-clay-300 border border-clay-200 dark:border-clay-800">
                   {title.length} characters
                 </span>
               </div>

               {dueDate && (
                 <div className="flex items-center space-x-2">
                   <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">Due:</span>
                   <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-stone-600 text-clay-600 dark:text-clay-300 border border-clay-200 dark:border-clay-800">
                     {new Date(dueDate).toLocaleDateString()}
                     {new Date(dueDate) < new Date() && (
                       <span className="ml-1.5 text-xs text-red-600 dark:text-red-400">• Overdue</span>
                     )}
                   </span>
                 </div>
               )}
             </div>

             <div className="flex items-center space-x-2 text-xs text-stone-500 dark:text-stone-400">
              <span>Task creation</span>
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                priority === 'high' ? 'bg-red-500' :
                priority === 'medium' ? 'bg-yellow-500' :
                'bg-green-500'
              }`}></div>
            </div>
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
            aria-label="Cancel task creation"
            disabled={isSubmitting}
            style={{
              ...(prefersReducedMotion ? { transition: 'none' } : {}),
              outline: isUsingKeyboard ? '2px solid #3b82f6' : 'none',
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
            className={`group relative bg-gradient-to-r from-clay-600 to-clay-700 py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white transition-all duration-300 ease-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-clay-500 focus:ring-offset-white dark:focus:ring-offset-stone-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${
              isSubmitting ? 'opacity-75 cursor-wait' : ''
            }`}
            aria-label={isSubmitting ? 'Creating task...' : 'Create task'}
            aria-busy={isSubmitting}
            style={{
              ...(prefersReducedMotion ? { transition: 'none' } : {}),
              outline: isUsingKeyboard ? '2px solid #f59e0b' : 'none',
              outlineOffset: isUsingKeyboard ? '2px' : '0'
            }}
          >
            <span className="flex items-center justify-center space-x-2">
              <svg className={`w-4 h-4 transition-opacity duration-300 ${isSubmitting ? 'opacity-100' : 'opacity-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{isSubmitting ? 'Creating...' : 'Create Task'}</span>
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

export default TaskForm;
