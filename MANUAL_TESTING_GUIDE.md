# kTracker Manual Testing Guide

## Overview
This guide provides step-by-step instructions for manually testing all features of the kTracker application to ensure everything works correctly.

## Prerequisites
- Both backend and frontend servers are running
- Backend server: http://localhost:3000
- Frontend server: http://localhost:5173
- A modern web browser (Chrome, Firefox, Safari, Edge)

## Testing Checklist

### 1. Application Startup & Basic Functionality
- [ ] **Frontend Loads**: Navigate to http://localhost:5173 and verify the application loads without errors
- [ ] **Backend API Accessible**: Backend server should be running on http://localhost:3000
- [ ] **Dark Mode Toggle**: Verify the theme toggle button works and persists theme preference
- [ ] **Responsive Design**: Test on different screen sizes (desktop, tablet, mobile)

### 2. Authentication System

#### 2.1 Registration
1. Navigate to http://localhost:5173/register
2. Fill out the registration form with:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Register"
4. **Expected**: Should redirect to Dashboard with success message
5. **Test with invalid data**:
   - Empty fields → Should show validation errors
   - Invalid email format → Should show validation error
   - Short password → Should show validation error

#### 2.2 Login
1. Navigate to http://localhost:5173/login
2. Enter valid credentials:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Login"
4. **Expected**: Should redirect to Dashboard
5. **Test with invalid data**:
   - Wrong email/password → Should show error message
   - Non-existent user → Should show error message

#### 2.3 Protected Routes
1. Log out of the application
2. Try to navigate directly to http://localhost:5173/dashboard
3. **Expected**: Should be redirected to login page

#### 2.4 Logout
1. Login to the application
2. Click the "Logout" button
3. **Expected**: Should be redirected to login page

### 3. Weight Tracking Feature

#### 3.1 Dashboard Integration
1. After login, verify you're on the Dashboard
2. Check that weight appears in the "Current Weight" card (should show "-- lbs" initially)
3. Verify the "Manage weight →" button works

#### 3.2 Add Weight Entry
1. Click "Add Weight Entry" on Dashboard
2. Fill out the form:
   - Weight: `180.5`
   - Date: Select today's date
3. Click "Add Entry"
4. **Expected**: Form should close, weight should appear in the list

#### 3.3 Weight List
1. In the weight section, verify the entry appears in the list
2. Check that the weight shows correctly (e.g., "180.5 lbs")
3. Check that the date shows correctly
4. **Test Delete Functionality**:
   - Click "Delete" on a weight entry
   - Confirm the deletion in the popup
   - **Expected**: Entry should be removed from the list

#### 3.4 Add Multiple Weight Entries
1. Add 3-5 different weight entries with different dates
2. **Expected**: All entries should appear in reverse chronological order

### 4. Workout Tracking Feature (NEW)

#### 4.1 Dashboard Integration
1. Navigate to the Dashboard
2. Click "Workouts" in the navigation
3. **Expected**: Should navigate to workout section (no longer shows "coming soon")

#### 4.2 Add Workout
1. Click "Add Workout"
2. Fill out the form:
   - Duration: `60` minutes
   - Date: Select today's date
   - Add exercises:
     - Exercise: "Bench Press"
     - Sets: `3`
     - Reps: `10`
     - Weight: `135`
   - Add another exercise:
     - Exercise: "Squat"
     - Sets: `4`
     - Reps: `8`
     - Weight: `185`
3. Click "Add Workout"
4. **Expected**: Form should close, workout should appear in the list

#### 4.3 Workout List
1. Verify the workout appears in the list
2. Check that it shows:
   - Duration (e.g., "60 minutes")
   - Date correctly
   - Number of exercises (e.g., "2 exercises")
3. **Test Delete Functionality**:
   - Click "Delete" on a workout
   - Confirm the deletion
   - **Expected**: Workout should be removed from the list

#### 4.4 Add Multiple Workouts
1. Add 2-3 different workouts with different exercises
2. **Expected**: All workouts should appear in reverse chronological order

### 5. Task Management Feature (NEW)

#### 5.1 Dashboard Integration
1. Navigate to the Dashboard
2. Click "Tasks" in the navigation
3. **Expected**: Should navigate to task section (no longer shows "coming soon")

#### 5.2 Create Task
1. Click "Create Task"
2. Fill out the form:
   - Title: `Complete project proposal`
   - Description: `Write and submit the quarterly project proposal`
   - Due Date: Set for next week
   - Priority: `High`
3. Click "Create Task"
4. **Expected**: Form should close, task should appear in the list

#### 5.3 Task List & Management
1. Verify the task appears in the list
2. Check that it shows:
   - Title correctly
   - Priority badge (e.g., "High" with red background)
   - Due date
3. **Test Task Completion**:
   - Click the checkbox next to the task
   - **Expected**: Task should be marked as completed (strikethrough text)
4. **Test Delete Functionality**:
   - Click "Delete" on a task
   - Confirm the deletion
   - **Expected**: Task should be removed from the list

#### 5.4 Task Sorting & Organization
1. Create multiple tasks with different priorities:
   - One "High" priority task
   - One "Medium" priority task
   - One "Low" priority task
2. **Expected**: Incomplete tasks should be sorted by priority (High → Medium → Low)
3. Mark a high priority task as complete
4. **Expected**: Incomplete tasks should still be sorted by priority, completed tasks should appear after incomplete ones

#### 5.5 Task Form Validation
1. Try creating a task with empty title
2. **Expected**: Should show validation error
3. Create a task with all fields filled
4. **Expected**: Task should be created successfully

### 6. Navigation & User Experience

#### 6.1 Main Navigation
1. Test navigation between all sections:
   - Dashboard
   - Weight
   - Workouts
   - Tasks
2. **Expected**: Smooth transitions between sections

#### 6.2 Mobile Navigation
1. Resize browser to mobile size (< 768px width)
2. Verify the bottom navigation appears
3. Test clicking on bottom navigation items
4. **Expected**: Should navigate to correct sections

#### 6.3 Quick Actions (Dashboard)
1. On the Dashboard, test the "Quick Actions" buttons:
   - "Add Weight Entry"
   - "Log Workout"
   - "Create Task"
2. **Expected**: Should navigate to the respective sections

### 7. Error Handling & Edge Cases

#### 7.1 Network Errors
1. Stop the backend server temporarily
2. Try to perform any action (add weight, workout, or task)
3. **Expected**: Should show appropriate error messages

#### 7.2 Form Validation
1. Test all form validations:
   - Empty required fields
   - Invalid data types
   - Boundary values (e.g., negative weights, unrealistic values)
2. **Expected**: Should show helpful error messages

#### 7.3 Concurrent Operations
1. Add multiple entries quickly in succession
2. **Expected**: All operations should complete successfully

### 8. Data Persistence

#### 8.1 Page Refresh
1. Add some data (weight, workout, tasks)
2. Refresh the browser page
3. **Expected**: All data should persist and be visible

#### 8.2 Session Persistence
1. Login to the application
2. Close the browser tab
3. Reopen the application
4. **Expected**: Should still be logged in (if using session storage)

### 9. Integration Testing

#### 9.1 End-to-End User Flow
1. Register a new user
2. Login
3. Add a weight entry
4. Add a workout with exercises
5. Create a task
6. Navigate between all sections
7. Log out
8. **Expected**: Complete flow should work without errors

#### 9.2 Cross-Feature Navigation
1. Start in one section (e.g., Weight)
2. Navigate to another section (e.g., Tasks)
3. Verify all features work correctly in each section

## Bug Reporting Template

If you encounter any issues, please document them with:

```
**Issue**: [Brief description of the issue]

**Steps to Reproduce**:
1.
2.
3.

**Expected Behavior**: [What should happen]

**Actual Behavior**: [What actually happens]

**Environment**:
- Browser: [e.g., Chrome 120.0]
- OS: [e.g., Windows 11]
- Screen Size: [e.g., 1920x1080]

**Screenshots**: [Attach if applicable]
```

## Success Criteria

The application should pass all tests in this guide. Key success indicators:

✅ **Authentication**: Users can register, login, and logout successfully
✅ **Weight Tracking**: Users can add, view, and delete weight entries
✅ **Workout Tracking**: Users can add workouts with exercises, view, and delete them
✅ **Task Management**: Users can create tasks with priorities, mark as complete, and delete them
✅ **Navigation**: Smooth transitions between all sections
✅ **Responsive Design**: Works on desktop, tablet, and mobile devices
✅ **Error Handling**: Appropriate error messages for invalid inputs and network issues
✅ **Data Persistence**: Data persists across page refreshes
✅ **User Experience**: Intuitive interface with clear feedback

## Performance Expectations

- Page loads should complete within 3 seconds
- Form submissions should respond within 2 seconds
- Navigation between sections should be instantaneous
- No console errors during normal use

## Next Steps After Testing

If all tests pass:
1. Consider adding more comprehensive data
2. Test with multiple users simultaneously (if possible)
3. Evaluate the application for any UX improvements

If issues are found:
1. Document them using the bug reporting template
2. Prioritize based on severity
3. Fix critical issues first
4. Re-test after fixes are implemented