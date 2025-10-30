# Testing Checklist - Leadership Development Project

## 🎯 Quiz Features

### Quiz Creation & Editing
- [X] Create a new quiz with:
  - [X] Title, description, category, difficulty
  - [X] Time limit set (optional) and without time limit
  - [X] Passing score
  - [X] Multiple choice questions (2+ options)
  - [X] Multiple answer questions (checkboxes)
  - [X] Short answer questions
  - [X] Questions with images
  - [X] Answer options with images
  - [X] Different point values per question
  - [X] Tags (preset and custom)

- [ ] Question shuffle option (shuffle order when taking quiz)

- [X] Edit an existing quiz:
  - [X] Modify quiz metadata (title, description, etc.)
  - [X] Change question text
  - [X] Change question type (verify options are preserved)
  - [X] Add new questions (verify existing questions keep their answers) ⭐
  - [X] Remove questions
  - [X] Duplicate questions
  - [X] Modify answer options
  - [X] Change correct answers
  - [X] Update/remove question images
  - [X] Update/remove option images
  - [X] Save and verify changes persist

### Quiz Taking
- [X] Start a quiz:
  - [X] Quiz with time limit (timer displays)
  - [X] Quiz without time limit (no timer)
  - [X] Timer counts down correctly
  - [X] Timer warning at 1 minute (yellow)
  - [X] Timer critical at 30 seconds (red, pulsing)
  - [X] Auto-submit when time expires

- [ ] Answer questions:
  - [X] Multiple choice (single selection)
  - [X] Multiple answer (multiple selections)
  - [X] Short answer (text input)
  - [X] Questions with images (click to enlarge)
  - [X] Options with images (click to enlarge)
  - [X] Navigate between questions (Previous/Next)
  - [ ] Review answers before submitting (Not implemented - feature to add)

- [X] Submit quiz:
  - [X] Manual submit
  - [X] Auto-submit on time expiry
  - [X] Results modal displays:
    - [X] Score percentage
    - [X] Pass/fail message
   е - [X] **Elapsed time displayed** ⭐
    - [X] Question breakdown with correct/incorrect status
    - [X] Your answers vs. correct answers

### Quiz Results & Review
- [X] View quiz results:
  - [X] Results table shows:
    - [X] Quiz name, category, score
    - [X] Date taken
    - [X] **Time taken (MM:SS format)** ⭐
  - [X] Mobile cards show:
    - [X] All result details including time taken
  - [X] Summary cards (total quizzes, average score, best score)
  - [X] View detailed results modal
  - [X] Results persist after page refresh
  - [X] Review/Retake mode available from results
  - [X] Export results to CSV
  - [X] Results analytics dashboard (avg score, pass rate, per-quiz stats)

### Question Bank / Library
- [ ] Create centralized question bank storage (DB)
- [ ] Add UI to browse/filter existing questions
- [ ] Allow adding questions from bank into a quiz
- [ ] Edits sync back to bank (or copy-on-add option)

### Quiz Assignment
- [X] Assign quiz to user:
  - [X] Single user assignment
  - [X] Multiple user assignment
  - [X] Set due date
  - [X] Verify assigned quiz appears for user
  - [X] Due date displays correctly on quiz card
  - [X] Overdue quizzes show correct styling

### Quiz Permissions
- [X] Test role-based permissions:
  - [X] Create Quiz tab visibility
  - [X] Edit Quiz button visibility
  - [X] Delete Quiz button visibility
  - [X] View Assignments visibility
  - [X] Assign Quiz functionality

---

## 📚 Module Features

### Module Creation & Management
- [X] Create module with all sections
- [X] Edit module content
- [X] Module assignment/unassignment
- [X] Due dates on modules
- [X] Progress tracking

### Module Progress & Admin View
- [X] User progress page (read-only):
  - [X] Modules display correctly
  - [X] Checklist items show correct status
  - [X] Performance review data displays
  - [X] Trainer comments display
  - [X] No editing capabilities

- [X] Admin user overview:
  - [X] Click module card opens detailed modal
  - [X] Module interface replicates user view
  - [X] Checklist items are editable
  - [X] Changes save to database
  - [X] Performance review editable
  - [X] Trainer comments editable
  - [X] Save button refreshes data
  - [X] Changes reflect in user's read-only view

---

## 👥 User Management

### User CRUD Operations
- [X] Create new user
- [X] Edit user details
- [X] Delete user
- [X] Search users
- [X] Filter users by role

### User Details Modal
- [X] View user information
- [X] Module assignments section
- [X] Quiz performance section
- [X] Reset progress functionality
- [X] Permission-controlled actions

---

## 🔐 Role & Permission Management

### Role Definitions
- [X] Create new role
- [X] Edit existing role:
  - [X] Role name
  - [X] Page access checkboxes (visibility changes)
  - [X] User Management permissions
  - [X] Module Management permissions
  - [X] Assignment Management permissions
  - [X] Quiz Management permissions
- [X] Delete role
- [X] Verify changes persist

### Permission Enforcement
- [X] Test each role:
  - [X] Admin - full access
  - [X] Director - custom permissions
  - [X] Manager - custom permissions
  - [X] Team Member - limited permissions

- [X] Verify visibility changes:
  - [ X] Tabs hide/show based on page access
  - [X] Buttons hide/show based on granular permissions
  - [X] Actions are blocked for unauthorized users
  - [X] Toast messages for denied actions

### Granular Permissions
- [X] Test each checkbox:
  - [X] Create Users
  - [X] Edit Users
  - [X] View Assignments
  - [X] Reset Progress
  - [X] Edit Quizzes
  - [X] Create Quizzes
  - [X] Unassign (module)
  - [X] Add New Module
  - [X] Edit Module
  - [X] Delete Module

---

## 🔔 General Features

### UI/UX
- [X] Navigation works across all pages (navbar-component.js loaded on all pages)
- [X] Mobile responsiveness (tested at 375x667px - navbar, cards, layouts responsive)
- [X] Modals open/close properly (modal-overlay with show/remove classes)
- [X] Toast notifications display (toast-component.js, showToast used throughout)
- [X] Loading states (showLoadingIndicator/hideLoadingIndicator functions)
- [X] Error handling (try/catch blocks with user-friendly toast messages and localStorage fallback)

### Data Persistence
- [X] All saves persist to database
- [X] Data loads correctly on page refresh
- [X] No localStorage-only data (except as fallback)
- [X] Image uploads work correctly
- [X] Images display in all contexts

### Edge Cases
- [ ] Empty states (no quizzes, no modules, no users)
- [ ] Long text handling
- [ ] Special characters in inputs
- [ ] Very large images (size limits)
- [ ] Network errors (graceful handling)
- [ ] Concurrent edits (last save wins)

---

## 🐛 Specific Bug Fixes to Verify

✅1. **Quiz Answer Preservation** ⭐
   - Edit quiz, add new question
   - Verify original questions keep their answers

✅2. **Quiz Time Tracking** ⭐
   - Take quiz with time limit
   - Verify elapsed time displays in results
   - Take quiz without time limit
   - Verify elapsed time still tracks

3. **Option Images** ⭐
   - Edit quiz with no option images
   - Verify no "Option Image" text appears
   - Add option images, verify they display
   - Remove option images, verify they're gone

4. **Timer Display** ⭐
   - Quiz with time limit shows timer
   - Timer updates every second
   - Warning/critical states activate
   - Auto-submit on expiry

---

## 📝 Testing Tips

1. **Test as Different Roles**: Create test accounts for each role and verify permissions
2. **Cross-Browser**: Test in Chrome, Firefox, Edge
3. **Mobile Devices**: Test responsive design on phones/tablets
4. **Data Scenarios**: 
   - Empty quiz (0 questions - should prevent save)
   - Single question quiz
   - Large quiz (10+ questions)
   - Quiz with all question types
5. **Image Testing**:
   - Various formats (JPG, PNG, GIF)
   - Various sizes
   - Broken/invalid images (error handling)
6.✅ **Time Testing**:
   - Very short time limit (1 minute)
   - Very long time limit (5 hours)
   - No time limit
7. **Database Consistency**:
   - Check.tables after operations
   - Verify foreign key constraints
   - Check for orphaned records

---

## ⚡ Quick Smoke Test

Run this quick test to verify core functionality:

1. ✅ Create quiz with 2 questions (multiple choice)
2. ✅ Set time limit to 2 minutes
3. ✅ Assign quiz to test user
4. ✅ Login as test user, take quiz
5. ✅ Verify timer displays and counts down
6. ✅ Complete quiz, verify results show time taken
7. ✅ Edit quiz, add 3rd question
8. ✅ Verify first 2 questions still have their answers
9. ✅ Save quiz, verify all changes persist

---

*Last Updated: Based on recent fixes for quiz answer preservation, time tracking, and option images*
