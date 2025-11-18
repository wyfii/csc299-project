# Task Breakdown: Task Manager CLI

**Feature**: Task Manager CLI  
**Status**: Ready for Implementation  
**Created**: November 18, 2025

---

## Phase 1: Core Data Model & Storage (User Story 1 - Foundation)

### Task 1.1: Create Task Class Structure
**File**: `task_manager.py`  
**Dependencies**: None

- [ ] Define Task class with __init__ method
- [ ] Add attributes: id, title, description, priority, status, created_at, completed_at
- [ ] Add type hints to all attributes
- [ ] Add validation in __init__ for priority and status enums
- [ ] Test: Can create Task instance with valid data

### Task 1.2: Implement Task Serialization Methods
**File**: `task_manager.py`  
**Dependencies**: Task 1.1

- [ ] Implement to_dict() method for JSON conversion
- [ ] Implement from_dict() class method for deserialization
- [ ] Handle None/null values for completed_at
- [ ] Test: Task can be converted to dict and back without data loss

### Task 1.3: Implement Task Display Methods
**File**: `task_manager.py`  
**Dependencies**: Task 1.1

- [ ] Implement __str__() for list view format
- [ ] Implement display_full() for detailed view
- [ ] Format output with clear labels and spacing
- [ ] Test: Task displays correctly in both formats

### Task 1.4: Create TaskManager Class Structure
**File**: `task_manager.py`  
**Dependencies**: Task 1.3

- [ ] Define TaskManager class with __init__ method
- [ ] Add tasks list attribute
- [ ] Add filename attribute (default "tasks.json")
- [ ] Call load_tasks() in __init__
- [ ] Test: TaskManager can be instantiated

### Task 1.5: Implement File Loading
**File**: `task_manager.py`  
**Dependencies**: Task 1.4

- [ ] Implement load_tasks() method
- [ ] Handle FileNotFoundError (first run)
- [ ] Handle JSONDecodeError (corrupted file)
- [ ] Handle PermissionError (no file access)
- [ ] Convert dictionaries to Task objects
- [ ] Test: Can load existing tasks.json file

### Task 1.6: Implement File Saving
**File**: `task_manager.py`  
**Dependencies**: Task 1.5

- [ ] Implement save_tasks() method
- [ ] Convert Task objects to dictionaries
- [ ] Write JSON with indent=4 for readability
- [ ] Handle write errors with clear messages
- [ ] Test: Tasks are saved to file correctly

### Task 1.7: Implement ID Generation
**File**: `task_manager.py`  
**Dependencies**: Task 1.5

- [ ] Implement get_next_id() method
- [ ] Handle empty task list (return 1)
- [ ] Find maximum existing ID and add 1
- [ ] Test: IDs increment correctly

**Checkpoint**: Can create Task objects and save/load them from JSON file

---

## Phase 2: Add & View Commands (User Story 1 - MVP)

### Task 2.1: Implement Add Task Method
**File**: `task_manager.py`  
**Dependencies**: Task 1.7

- [ ] Implement add_task() method
- [ ] Validate title is not empty
- [ ] Validate priority enum value
- [ ] Generate new ID using get_next_id()
- [ ] Create timestamp using datetime.now().isoformat()
- [ ] Create Task object with defaults
- [ ] Add to tasks list
- [ ] Call save_tasks()
- [ ] Return created Task
- [ ] Test: Can add task and it persists to file

### Task 2.2: Implement Get Task Method
**File**: `task_manager.py`  
**Dependencies**: Task 1.5

- [ ] Implement get_task() method
- [ ] Search tasks list for matching ID
- [ ] Return Task object or None
- [ ] Test: Can retrieve existing task by ID

### Task 2.3: Implement List Tasks Method
**File**: `task_manager.py`  
**Dependencies**: Task 1.5

- [ ] Implement list_tasks() method
- [ ] Accept optional status_filter parameter
- [ ] Filter by status if provided
- [ ] Return list of Task objects
- [ ] Test: Can list all tasks, and filter by status

### Task 2.4: Create Main Function and Command Router
**File**: `task_manager.py`  
**Dependencies**: Task 1.4

- [ ] Create main() function
- [ ] Check sys.argv length
- [ ] Parse command from sys.argv[1]
- [ ] Create TaskManager instance
- [ ] Implement command routing with if/elif
- [ ] Handle unknown commands
- [ ] Add if __name__ == "__main__": guard
- [ ] Test: Can run script and see appropriate messages

### Task 2.5: Implement Help Command
**File**: `task_manager.py`  
**Dependencies**: Task 2.4

- [ ] Create print_help() function
- [ ] Document all commands with syntax
- [ ] Include examples for each command
- [ ] Show valid values for enums (status, priority)
- [ ] Test: Help displays complete usage information

### Task 2.6: Implement Add Command Handler
**File**: `task_manager.py`  
**Dependencies**: Task 2.1, Task 2.4

- [ ] Create handle_add() function
- [ ] Check for minimum arguments (title)
- [ ] Parse title, description, priority from args
- [ ] Handle optional arguments with defaults
- [ ] Call manager.add_task()
- [ ] Display success message with task ID
- [ ] Handle validation errors with helpful messages
- [ ] Test: Can add tasks via CLI with various argument combinations

### Task 2.7: Implement List Command Handler
**File**: `task_manager.py`  
**Dependencies**: Task 2.3, Task 2.4

- [ ] Create handle_list() function
- [ ] Parse optional status filter from args
- [ ] Call manager.list_tasks() with filter
- [ ] Display task count
- [ ] Display each task using __str__()
- [ ] Handle empty list with friendly message
- [ ] Test: Can list tasks via CLI with and without filter

### Task 2.8: Implement View Command Handler
**File**: `task_manager.py`  
**Dependencies**: Task 2.2, Task 2.4

- [ ] Create handle_view() function
- [ ] Check for task ID argument
- [ ] Parse and validate ID as integer
- [ ] Call manager.get_task()
- [ ] Display task using display_full()
- [ ] Handle task not found error
- [ ] Handle invalid ID format error
- [ ] Test: Can view task details via CLI

**Checkpoint**: Users can add tasks, list them, and view details via CLI. Data persists correctly.

---

## Phase 3: Status Management (User Story 2 - Progress Tracking)

### Task 3.1: Implement Update Status Method
**File**: `task_manager.py`  
**Dependencies**: Task 2.2

- [ ] Implement update_status() method
- [ ] Validate status enum value
- [ ] Get task by ID
- [ ] Update task status
- [ ] If status is "completed", set completed_at timestamp
- [ ] If status is not "completed", set completed_at to None
- [ ] Call save_tasks()
- [ ] Return success boolean
- [ ] Test: Status updates persist and timestamps are set correctly

### Task 3.2: Implement Update Command Handler
**File**: `task_manager.py`  
**Dependencies**: Task 3.1, Task 2.4

- [ ] Create handle_update() function
- [ ] Check for task ID and status arguments
- [ ] Parse and validate ID as integer
- [ ] Validate status enum value
- [ ] Call manager.update_status()
- [ ] Display success message
- [ ] Handle task not found error
- [ ] Handle invalid status error
- [ ] Display valid status options on error
- [ ] Test: Can update task status via CLI

**Checkpoint**: Users can update task status and completed timestamp is tracked correctly.

---

## Phase 4: Search & Filter (User Stories 4 & 5 - Findability)

### Task 4.1: Implement Search Tasks Method
**File**: `task_manager.py`  
**Dependencies**: Task 1.5

- [ ] Implement search_tasks() method
- [ ] Accept query string parameter
- [ ] Convert query to lowercase for case-insensitive search
- [ ] Search in task title (lowercase)
- [ ] Search in task description (lowercase)
- [ ] Return list of matching Task objects
- [ ] Test: Can find tasks by title and description keywords

### Task 4.2: Implement Search Command Handler
**File**: `task_manager.py`  
**Dependencies**: Task 4.1, Task 2.4

- [ ] Create handle_search() function
- [ ] Check for query argument
- [ ] Join multiple arguments into single query string
- [ ] Call manager.search_tasks()
- [ ] Display count of matches
- [ ] Display each matching task using __str__()
- [ ] Handle no matches with friendly message
- [ ] Test: Can search tasks via CLI

### Task 4.3: Update List Handler for Status Filter
**File**: `task_manager.py`  
**Dependencies**: Task 2.7

- [ ] Modify handle_list() to use status filter from args
- [ ] Validate status filter value if provided
- [ ] Pass filter to manager.list_tasks()
- [ ] Display filter information in output
- [ ] Handle invalid filter with helpful message
- [ ] Test: List with status filter works correctly

**Checkpoint**: Users can search tasks and filter by status.

---

## Phase 5: Delete & Error Handling (User Story 6 - Cleanup)

### Task 5.1: Implement Delete Task Method
**File**: `task_manager.py`  
**Dependencies**: Task 2.2

- [ ] Implement delete_task() method
- [ ] Get task by ID to verify existence
- [ ] Remove task from tasks list
- [ ] Call save_tasks()
- [ ] Return success boolean
- [ ] Test: Task is removed from list and file

### Task 5.2: Implement Delete Command Handler
**File**: `task_manager.py`  
**Dependencies**: Task 5.1, Task 2.4

- [ ] Create handle_delete() function
- [ ] Check for task ID argument
- [ ] Parse and validate ID as integer
- [ ] Call manager.delete_task()
- [ ] Display success message
- [ ] Handle task not found error
- [ ] Handle invalid ID format error
- [ ] Test: Can delete tasks via CLI

### Task 5.3: Add Comprehensive Error Handling
**File**: `task_manager.py`  
**Dependencies**: All previous tasks

- [ ] Review all command handlers for error cases
- [ ] Add try-except blocks for integer parsing
- [ ] Ensure all errors have helpful messages
- [ ] Ensure all errors suggest correct usage
- [ ] Add error handling for empty title
- [ ] Add validation feedback for enum values
- [ ] Test: All error cases display helpful messages

### Task 5.4: Handle Edge Cases
**File**: `task_manager.py`  
**Dependencies**: All previous tasks

- [ ] Handle empty task list in list command
- [ ] Handle empty task list in search command
- [ ] Handle no results in search command
- [ ] Handle special characters in input
- [ ] Handle very long strings (1000+ chars)
- [ ] Test: All edge cases handled gracefully

**Checkpoint**: Users can delete tasks and all error cases provide helpful guidance.

---

## Phase 6: Documentation & Polish (All User Stories - Completeness)

### Task 6.1: Create README.md
**File**: `README.md`  
**Dependencies**: None (can be done in parallel)

- [ ] Add title and description
- [ ] List features
- [ ] Document requirements
- [ ] Provide installation instructions
- [ ] Document all commands with syntax
- [ ] Add examples for each command
- [ ] Include quick-start workflow
- [ ] Document data storage format
- [ ] List task statuses and priorities
- [ ] Add troubleshooting section
- [ ] Test: README is complete and accurate

### Task 6.2: Add Code Documentation
**File**: `task_manager.py`  
**Dependencies**: All implementation tasks

- [ ] Add module-level docstring
- [ ] Add docstrings to Task class and all methods
- [ ] Add docstrings to TaskManager class and all methods
- [ ] Add docstrings to all command handler functions
- [ ] Add docstrings to main() and print_help()
- [ ] Add inline comments for complex logic
- [ ] Test: All public functions have docstrings

### Task 6.3: Improve Output Formatting
**File**: `task_manager.py`  
**Dependencies**: All command handlers

- [ ] Improve task list display format
- [ ] Add borders or separators for readability
- [ ] Format timestamps for better readability
- [ ] Add color priority indicators (optional)
- [ ] Ensure consistent spacing and alignment
- [ ] Test: Output is clear and professional

### Task 6.4: Create Demo Script (Optional)
**File**: `demo.sh`  
**Dependencies**: Task 6.1

- [ ] Create bash script with example commands
- [ ] Add comments explaining each step
- [ ] Cover all major features
- [ ] Make script executable (chmod +x)
- [ ] Test: Demo script runs successfully

### Task 6.5: Final Testing
**File**: All files  
**Dependencies**: All previous tasks

- [ ] Run through all user stories end-to-end
- [ ] Test all commands with valid inputs
- [ ] Test all commands with invalid inputs
- [ ] Test data persistence (restart between tests)
- [ ] Test edge cases systematically
- [ ] Verify all success criteria from spec
- [ ] Test: All acceptance criteria pass

### Task 6.6: Code Quality Check
**File**: `task_manager.py`  
**Dependencies**: All implementation tasks

- [ ] Check code follows PEP 8 style guide
- [ ] Run pylint or flake8 (if available)
- [ ] Fix any critical linting issues
- [ ] Ensure consistent naming conventions
- [ ] Check for unused imports
- [ ] Test: Code passes basic quality checks

**Checkpoint**: Application is complete, documented, and tested.

---

## Implementation Summary

### Total Tasks: 32

**Phase 1 (Foundation)**: 7 tasks  
**Phase 2 (MVP)**: 8 tasks  
**Phase 3 (Status)**: 2 tasks  
**Phase 4 (Search)**: 3 tasks  
**Phase 5 (Delete)**: 4 tasks  
**Phase 6 (Documentation)**: 6 tasks  

### Estimated Effort
- **Phase 1**: 2-3 hours (data model and persistence)
- **Phase 2**: 2-3 hours (core CLI functionality)
- **Phase 3**: 1 hour (status updates)
- **Phase 4**: 1 hour (search and filter)
- **Phase 5**: 1 hour (delete and error handling)
- **Phase 6**: 2 hours (documentation and polish)

**Total**: 9-11 hours (spread over multiple sessions recommended)

### Key Milestones
1. After Phase 1: Can create and persist tasks programmatically
2. After Phase 2: Usable CLI for basic task management (MVP)
3. After Phase 3: Progress tracking fully functional
4. After Phase 4: Enhanced findability and filtering
5. After Phase 5: Complete CRUD operations with robust error handling
6. After Phase 6: Professional, production-ready application

---

## Implementation Order Rationale

**Bottom-Up Approach**: Build foundation first, then add features on top
1. Data model provides foundation for everything else
2. File I/O enables persistence testing early
3. Core commands (add, list, view) provide MVP
4. Status management adds critical tracking
5. Search/filter enhances usability
6. Delete completes CRUD operations
7. Documentation ensures usability

**Independent Testability**: Each phase can be tested independently
- Phase 1: Test with Python REPL
- Phase 2: Test with CLI commands
- Phase 3+: Test via CLI with persistent data

---

*Follow this task breakdown sequentially for structured, test-driven implementation of the Task Manager CLI.*

