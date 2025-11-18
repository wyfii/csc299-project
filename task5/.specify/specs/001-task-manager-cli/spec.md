# Feature Specification: Task Manager CLI

**Feature Branch**: `001-task-manager-cli`  
**Created**: November 18, 2025  
**Status**: Draft  
**Input**: Build a command-line task manager with persistent JSON storage for CSC299 coursework

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add and View Tasks (Priority: P1)

A student needs to quickly capture tasks as they come up during class and view them later. They should be able to add a task with a title, see it in their list, and view its full details.

**Why this priority**: Core functionality - without the ability to add and view tasks, the application has no value. This is the MVP (Minimum Viable Product).

**Independent Test**: Can be fully tested by adding a task, listing all tasks to confirm it appears, and viewing the task details to confirm all information is stored correctly.

**Acceptance Scenarios**:

1. **Given** an empty task list, **When** user adds a task with title "Study for exam", **Then** the task is created with ID 1, status "pending", and current timestamp
2. **Given** tasks exist in the system, **When** user runs list command, **Then** all tasks are displayed with their ID, title, priority, and status
3. **Given** a task with ID 1 exists, **When** user runs view command with ID 1, **Then** complete task details are displayed including title, description, priority, status, and timestamps
4. **Given** user provides invalid task ID, **When** user runs view command, **Then** a clear error message is displayed

---

### User Story 2 - Organize with Status Updates (Priority: P2)

As a student progresses through their work, they need to track which tasks they're currently working on and which are completed. They should be able to update task status to reflect their current work state.

**Why this priority**: Status tracking is essential for task management but the app is still useful without it (users could just delete completed tasks).

**Independent Test**: Can be tested by creating a task, updating its status to "in_progress", then to "completed", and verifying the status changes are persisted.

**Acceptance Scenarios**:

1. **Given** a task exists with status "pending", **When** user updates its status to "in_progress", **Then** the task status changes and the change persists across sessions
2. **Given** a task exists with any status, **When** user updates its status to "completed", **Then** the task status changes to "completed" and a completion timestamp is recorded
3. **Given** a task exists, **When** user provides an invalid status value, **Then** a clear error message lists valid status options (pending, in_progress, completed, cancelled)
4. **Given** user provides invalid task ID, **When** user attempts status update, **Then** appropriate error message is displayed

---

### User Story 3 - Prioritize Important Work (Priority: P3)

A student needs to distinguish between urgent assignments and routine tasks. They should be able to set priority levels when creating tasks and see those priorities in their task list.

**Why this priority**: Priority helps with planning but isn't essential for basic task tracking. Users can work around this by putting priority in the title.

**Independent Test**: Can be tested by creating tasks with different priority levels (high, medium, low) and verifying priorities are displayed correctly in listings.

**Acceptance Scenarios**:

1. **Given** user is adding a new task, **When** they specify "high" priority, **Then** the task is created with high priority
2. **Given** user is adding a new task without specifying priority, **When** the task is created, **Then** it defaults to "medium" priority
3. **Given** tasks exist with different priorities, **When** user lists tasks, **Then** priority is clearly displayed for each task
4. **Given** user provides invalid priority, **When** creating task, **Then** error message shows valid options (low, medium, high) and defaults to medium

---

### User Story 4 - Find Tasks Quickly (Priority: P3)

When a student has many tasks, they need to find specific ones quickly by searching through titles and descriptions rather than scrolling through the entire list.

**Why this priority**: Search is convenient but not essential for small task lists. Users can manually scan the list output.

**Independent Test**: Can be tested by creating several tasks with distinct keywords, searching for those keywords, and verifying correct matches are returned.

**Acceptance Scenarios**:

1. **Given** multiple tasks exist with varying titles and descriptions, **When** user searches for a keyword that appears in a task title, **Then** all matching tasks are displayed
2. **Given** multiple tasks exist, **When** user searches for a keyword that appears in a task description, **Then** matching tasks are displayed
3. **Given** tasks exist, **When** user searches for a term that doesn't match any task, **Then** a message indicates no tasks were found
4. **Given** search term is provided, **When** it matches multiple tasks, **Then** all matches are displayed with clear formatting

---

### User Story 5 - Filter by Status (Priority: P3)

A student wants to focus on specific types of tasks - see only what needs to be done (pending), what's in progress, or review what's been completed.

**Why this priority**: Filtering improves usability but users can still scan the full list manually.

**Independent Test**: Can be tested by creating tasks in different statuses, then using list command with status filter to verify only matching tasks appear.

**Acceptance Scenarios**:

1. **Given** tasks exist in multiple statuses, **When** user lists with "pending" filter, **Then** only pending tasks are displayed
2. **Given** tasks exist in multiple statuses, **When** user lists with "completed" filter, **Then** only completed tasks are displayed
3. **Given** tasks exist, **When** user lists without status filter, **Then** all tasks are displayed regardless of status
4. **Given** user provides invalid status filter, **When** listing tasks, **Then** error message shows valid filter options

---

### User Story 6 - Remove Unnecessary Tasks (Priority: P2)

Sometimes tasks become irrelevant or were added by mistake. Students need the ability to permanently remove tasks from their list.

**Why this priority**: Deletion is important for managing clutter but the app remains functional without it (users could mark tasks as "cancelled").

**Independent Test**: Can be tested by creating a task, deleting it by ID, and verifying it no longer appears in the task list or persisted data.

**Acceptance Scenarios**:

1. **Given** a task exists with specific ID, **When** user deletes that task, **Then** the task is removed from storage and no longer appears in listings
2. **Given** user attempts to delete non-existent task ID, **When** delete command is executed, **Then** clear error message indicates the task doesn't exist
3. **Given** multiple tasks exist, **When** user deletes one task, **Then** only that task is removed and others remain intact
4. **Given** task is deleted, **When** user subsequently views or updates that task ID, **Then** appropriate error messages indicate task no longer exists

---

### Edge Cases

- **Empty task list**: What happens when user lists/searches tasks but none exist? Display friendly message like "No tasks found"
- **Invalid JSON file**: What happens if the tasks.json file is corrupted or contains invalid JSON? Start with empty task list and log warning
- **Missing tasks.json file**: What happens on first run when no file exists? Create new file automatically on first task addition
- **File permission errors**: What happens if the application can't write to tasks.json? Display clear error message about file permissions
- **Very long task titles/descriptions**: Should handle at least 1000 characters without truncation or errors
- **Concurrent access**: What if multiple instances modify tasks.json simultaneously? Document as known limitation (out of scope for MVP)
- **Special characters in input**: Should handle quotes, newlines, and special characters in task content properly
- **Empty strings as input**: Should reject empty titles but allow empty descriptions

---

## Requirements *(mandatory)*

### Functional Requirements

#### Core Task Operations
- **FR-001**: System MUST allow users to create a new task with a title (required), description (optional), and priority (optional, default: medium)
- **FR-002**: System MUST assign a unique, auto-incrementing integer ID to each newly created task
- **FR-003**: System MUST automatically set task status to "pending" when created
- **FR-004**: System MUST record ISO 8601 timestamp when task is created
- **FR-005**: System MUST allow users to view details of a specific task by providing its ID
- **FR-006**: System MUST allow users to list all tasks in the system
- **FR-007**: System MUST allow users to update the status of an existing task
- **FR-008**: System MUST allow users to delete a task by its ID
- **FR-009**: System MUST allow users to search for tasks by keyword in title or description
- **FR-010**: System MUST allow users to filter task list by status

#### Data Validation
- **FR-011**: System MUST validate that task titles are not empty
- **FR-012**: System MUST validate that status values are one of: pending, in_progress, completed, cancelled
- **FR-013**: System MUST validate that priority values are one of: low, medium, high
- **FR-014**: System MUST validate that task IDs are positive integers
- **FR-015**: System MUST display clear error messages for invalid inputs

#### Data Persistence
- **FR-016**: System MUST persist all tasks to a JSON file named "tasks.json"
- **FR-017**: System MUST load existing tasks from tasks.json when application starts
- **FR-018**: System MUST update tasks.json after every modification (add, update, delete)
- **FR-019**: System MUST handle missing or corrupted tasks.json file gracefully
- **FR-020**: System MUST format JSON output with proper indentation for human readability

#### Timestamp Management
- **FR-021**: System MUST record completed_at timestamp when task status changes to "completed"
- **FR-022**: System MUST store all timestamps in ISO 8601 format
- **FR-023**: System MUST set completed_at to null for non-completed tasks

#### Command-Line Interface
- **FR-024**: System MUST support command syntax: `python3 task_manager.py <command> [arguments]`
- **FR-025**: System MUST provide a help command that displays usage information
- **FR-026**: System MUST display clear error messages when commands are malformed
- **FR-027**: System MUST display success messages after successful operations

### Key Entities

- **Task**: Represents a single task item with the following attributes:
  - `id` (integer): Unique identifier, auto-incremented starting from 1
  - `title` (string): Required, non-empty task title
  - `description` (string): Optional task description, can be empty
  - `priority` (enum): One of "low", "medium", "high" (default: "medium")
  - `status` (enum): One of "pending", "in_progress", "completed", "cancelled" (default: "pending")
  - `created_at` (ISO 8601 string): Timestamp when task was created
  - `completed_at` (ISO 8601 string or null): Timestamp when task was completed, null if not completed

- **TaskManager**: Application component that manages the collection of tasks and file operations
  - Maintains in-memory list of all tasks
  - Handles loading from and saving to JSON file
  - Provides CRUD operations (Create, Read, Update, Delete)
  - Validates all inputs before modification

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: User can successfully add a task and see it appear in the task list within 1 second
- **SC-002**: User can update task status and the change persists after restarting the application
- **SC-003**: User can perform all core operations (add, list, view, update, delete, search) without referring to documentation after reading help command once
- **SC-004**: Application handles all documented edge cases without crashing or losing data
- **SC-005**: JSON file remains valid and human-readable after any sequence of operations
- **SC-006**: Error messages provide enough information for users to correct their input without external help
- **SC-007**: Application performs adequately with at least 100 tasks without noticeable slowdown (<1 second response time)
- **SC-008**: Zero data loss scenarios - all operations either succeed completely or fail safely without partial updates

### Quality Indicators

- Code passes basic Python linting (pylint or flake8) with no critical errors
- All functions have docstrings explaining their purpose
- README includes working examples for every command
- Manual testing confirms all user stories can be completed successfully
- File operations use proper error handling for all failure scenarios

---

## Out of Scope

The following are explicitly **not** included in this version:

- Database backend (SQLite, PostgreSQL, etc.)
- Graphical user interface (GUI)
- Web interface or API
- User authentication or multi-user support
- Task categories or tags
- Due dates or reminders
- Task dependencies or subtasks
- Undo/redo functionality
- Task recurrence or templates
- Export to other formats (CSV, PDF, etc.)
- Cloud synchronization
- Mobile app version
- Concurrent access protection (file locking)

These may be considered for future enhancements but are not required for the current assignment.

---

## Technical Considerations

### Implementation Approach
- Single Python file acceptable for MVP (task_manager.py)
- Use Python's built-in `json` module for data persistence
- Use `argparse` or simple sys.argv parsing for command-line interface
- Use `datetime` module for ISO 8601 timestamp formatting

### Testing Strategy
- Create comprehensive README with example usage for each command
- Manually test all user stories in sequence
- Test edge cases systematically
- Verify data persistence by stopping and restarting application

### Documentation Requirements
- README.md with complete usage instructions
- Example workflows demonstrating common usage patterns
- Troubleshooting section for common errors
- Command reference with all options documented

---

*This specification defines the complete scope for the Task Manager CLI application for CSC299 coursework.*

