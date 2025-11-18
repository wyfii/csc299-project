# Implementation Plan: Task Manager CLI

**Feature**: Task Manager CLI  
**Created**: November 18, 2025  
**Tech Stack**: Python 3.6+, JSON (standard library)  
**Status**: Ready for Implementation

---

## Technology Stack

### Core Technologies
- **Language**: Python 3.6+ (for compatibility with educational environments)
- **Data Storage**: JSON file format (`tasks.json`)
- **CLI Framework**: Standard library (`sys.argv` or `argparse`)
- **Date/Time**: Python `datetime` module with ISO 8601 format

### Dependencies
- **None** - Using only Python standard library modules:
  - `json` - for data serialization/deserialization
  - `sys` - for command-line argument parsing
  - `datetime` - for timestamp generation
  - `os` - for file operations and path handling
  - `typing` - for type hints (optional, for code clarity)

### Development Tools
- **Python 3.6+** - interpreter
- **Text editor** - any editor for Python development
- **Git** - for version control

---

## Architecture Overview

### Design Pattern
**Simple Procedural/Object-Oriented Hybrid**

```
task_manager.py
├── Task (class) - Data model for individual task
├── TaskManager (class) - Business logic and file I/O
└── main() - CLI command routing and user interaction
```

### File Structure
```
001-task-manager-cli/
├── task_manager.py          # Main application file
├── tasks.json                # Data file (created at runtime)
├── README.md                 # User documentation
└── demo.sh (optional)        # Demo script for testing
```

### Data Model

```python
Task {
    id: int                    # Auto-increment starting at 1
    title: str                 # Required, non-empty
    description: str           # Optional, can be empty
    priority: str              # "low" | "medium" | "high"
    status: str                # "pending" | "in_progress" | "completed" | "cancelled"
    created_at: str            # ISO 8601 timestamp
    completed_at: str | None   # ISO 8601 timestamp or null
}
```

### JSON Storage Format

```json
[
    {
        "id": 1,
        "title": "Study for exam",
        "description": "Chapters 1-5",
        "priority": "high",
        "status": "in_progress",
        "created_at": "2025-11-18T10:30:00",
        "completed_at": null
    },
    {
        "id": 2,
        "title": "Submit assignment",
        "description": "CSC299 Task 5",
        "priority": "medium",
        "status": "completed",
        "created_at": "2025-11-18T11:00:00",
        "completed_at": "2025-11-18T15:30:00"
    }
]
```

---

## Component Design

### 1. Task Class

**Purpose**: Represent a single task with all its attributes

**Responsibilities**:
- Store task data
- Provide data validation
- Convert to/from dictionary for JSON serialization
- Format task display output

**Key Methods**:
```python
class Task:
    def __init__(self, id, title, description="", priority="medium", 
                 status="pending", created_at=None, completed_at=None)
    
    def to_dict(self) -> dict
        """Convert task to dictionary for JSON serialization"""
    
    @staticmethod
    def from_dict(data: dict) -> Task
        """Create task from dictionary loaded from JSON"""
    
    def __str__(self) -> str
        """Format task for display in list view"""
    
    def display_full(self) -> str
        """Format task with all details for view command"""
```

**Validation Rules**:
- Title cannot be empty string
- Priority must be one of: "low", "medium", "high"
- Status must be one of: "pending", "in_progress", "completed", "cancelled"
- ID must be positive integer
- Timestamps must be valid ISO 8601 strings

---

### 2. TaskManager Class

**Purpose**: Manage the collection of tasks and handle file I/O

**Responsibilities**:
- Load tasks from JSON file
- Save tasks to JSON file
- Generate unique task IDs
- Perform CRUD operations on tasks
- Search and filter tasks

**Key Methods**:
```python
class TaskManager:
    def __init__(self, filename="tasks.json"):
        """Initialize with file path, load existing tasks"""
    
    def load_tasks(self) -> None:
        """Load tasks from JSON file, handle file not found/corrupted"""
    
    def save_tasks(self) -> None:
        """Save all tasks to JSON file with proper formatting"""
    
    def get_next_id(self) -> int:
        """Generate next available task ID"""
    
    def add_task(self, title: str, description: str = "", 
                 priority: str = "medium") -> Task:
        """Create and add new task, return the created task"""
    
    def get_task(self, task_id: int) -> Task | None:
        """Retrieve task by ID, return None if not found"""
    
    def list_tasks(self, status_filter: str = None) -> list[Task]:
        """Get all tasks, optionally filtered by status"""
    
    def update_status(self, task_id: int, new_status: str) -> bool:
        """Update task status, handle completed_at timestamp, return success"""
    
    def delete_task(self, task_id: int) -> bool:
        """Remove task from collection, return success"""
    
    def search_tasks(self, query: str) -> list[Task]:
        """Find tasks matching query in title or description"""
```

**File I/O Strategy**:
- Load entire file into memory on startup (acceptable for task list sizes)
- Write entire file on every modification (simple, safe approach)
- Use atomic write (write to temp file, then rename) for data safety
- Handle file permissions errors gracefully with clear messages

---

### 3. CLI Interface (main function)

**Purpose**: Parse command-line arguments and route to appropriate operations

**Command Structure**:
```
python3 task_manager.py <command> [arguments]

Commands:
  add <title> [description] [priority]    # Add new task
  list [status]                           # List tasks, optionally filtered
  view <id>                               # View task details
  update <id> <status>                    # Update task status
  delete <id>                             # Delete task
  search <query>                          # Search tasks
  help                                    # Show help message
```

**Routing Logic**:
```python
def main():
    """Main entry point - parse args and dispatch to handlers"""
    
    if len(sys.argv) < 2:
        print_help()
        return
    
    command = sys.argv[1].lower()
    manager = TaskManager()
    
    if command == "add":
        handle_add(manager, sys.argv[2:])
    elif command == "list":
        handle_list(manager, sys.argv[2:])
    elif command == "view":
        handle_view(manager, sys.argv[2:])
    elif command == "update":
        handle_update(manager, sys.argv[2:])
    elif command == "delete":
        handle_delete(manager, sys.argv[2:])
    elif command == "search":
        handle_search(manager, sys.argv[2:])
    elif command == "help":
        print_help()
    else:
        print(f"Unknown command: {command}")
        print_help()
```

**Command Handlers** (one function per command):
```python
def handle_add(manager: TaskManager, args: list):
    """Handle 'add' command with validation"""

def handle_list(manager: TaskManager, args: list):
    """Handle 'list' command with optional status filter"""

def handle_view(manager: TaskManager, args: list):
    """Handle 'view' command with ID validation"""

def handle_update(manager: TaskManager, args: list):
    """Handle 'update' command with validation"""

def handle_delete(manager: TaskManager, args: list):
    """Handle 'delete' command with confirmation"""

def handle_search(manager: TaskManager, args: list):
    """Handle 'search' command"""

def print_help():
    """Display comprehensive help message"""
```

---

## Implementation Phases

### Phase 1: Core Data Model & Storage (P1)
**Goal**: Implement Task class and TaskManager with basic file I/O

**Tasks**:
1. Create Task class with all attributes
2. Implement Task.to_dict() and Task.from_dict()
3. Create TaskManager class with load_tasks() and save_tasks()
4. Implement get_next_id() for ID generation
5. Test: Can create tasks and save/load from JSON file

**Validation**: Create a task manually in Python, save it, restart and load it successfully

---

### Phase 2: Add & View Commands (P1)
**Goal**: Users can create tasks and view them

**Tasks**:
1. Implement TaskManager.add_task()
2. Implement TaskManager.get_task()
3. Implement TaskManager.list_tasks()
4. Create main() with command routing
5. Implement handle_add() command handler
6. Implement handle_list() command handler
7. Implement handle_view() command handler
8. Implement print_help()

**Validation**: 
- Add tasks via CLI
- List tasks via CLI
- View specific task via CLI
- Verify data persists after restart

---

### Phase 3: Status Management (P2)
**Goal**: Users can update task status and track progress

**Tasks**:
1. Implement TaskManager.update_status()
2. Add completed_at timestamp logic
3. Implement handle_update() command handler
4. Add status validation
5. Test status changes and timestamp recording

**Validation**:
- Update task to "in_progress"
- Update task to "completed" and verify completed_at is set
- Verify invalid status shows error message
- Verify changes persist after restart

---

### Phase 4: Search & Filter (P3)
**Goal**: Users can find tasks quickly

**Tasks**:
1. Implement TaskManager.search_tasks()
2. Add case-insensitive search in title and description
3. Implement handle_search() command handler
4. Add status filter to list_tasks()
5. Update handle_list() to accept status filter

**Validation**:
- Search finds tasks by title keyword
- Search finds tasks by description keyword
- List with status filter shows only matching tasks
- Empty results show friendly message

---

### Phase 5: Delete & Error Handling (P2)
**Goal**: Users can remove tasks and get helpful error messages

**Tasks**:
1. Implement TaskManager.delete_task()
2. Implement handle_delete() command handler
3. Add comprehensive error handling to all commands
4. Add input validation with helpful error messages
5. Handle edge cases (empty list, invalid IDs, corrupted JSON)

**Validation**:
- Delete task removes it from list and file
- Invalid commands show helpful error messages
- Corrupted JSON file recovers gracefully
- Missing arguments prompt user with usage info

---

### Phase 6: Documentation & Polish (All Priorities)
**Goal**: Complete, professional documentation and user experience

**Tasks**:
1. Write comprehensive README.md with all commands
2. Add usage examples for every command
3. Create quick-start workflow example
4. Document edge cases and troubleshooting
5. Add code comments and docstrings
6. Format output for better readability
7. Create optional demo.sh script

**Validation**:
- README includes working example for every command
- New user can use app after reading README once
- Code is readable and well-documented
- All docstrings are complete

---

## Error Handling Strategy

### File Operations
```python
try:
    with open(self.filename, 'r') as f:
        data = json.load(f)
except FileNotFoundError:
    # First run - no file exists yet
    self.tasks = []
except json.JSONDecodeError:
    # Corrupted file
    print("Warning: tasks.json is corrupted. Starting with empty list.")
    self.tasks = []
except PermissionError:
    # No file access
    print("Error: Cannot read tasks.json - check file permissions")
    sys.exit(1)
```

### Command Validation
```python
# Check argument count
if len(args) < 1:
    print("Error: Missing required argument")
    print("Usage: python3 task_manager.py add <title> [description] [priority]")
    return

# Validate enum values
valid_statuses = ["pending", "in_progress", "completed", "cancelled"]
if status not in valid_statuses:
    print(f"Error: Invalid status '{status}'")
    print(f"Valid options: {', '.join(valid_statuses)}")
    return
```

### User-Friendly Messages
- Every error includes context about what went wrong
- Every error suggests how to fix it
- Success messages confirm what was done
- No silent failures

---

## Testing Strategy

### Manual Test Cases

**Test 1: First Run**
```bash
# Should create tasks.json on first add
python3 task_manager.py add "Test task"
# Verify tasks.json exists and contains the task
cat tasks.json
```

**Test 2: Complete Workflow**
```bash
# Add tasks with different priorities
python3 task_manager.py add "High priority task" "Important" high
python3 task_manager.py add "Normal task" "Regular work" medium
python3 task_manager.py add "Low priority" "" low

# List all tasks
python3 task_manager.py list

# Update status
python3 task_manager.py update 1 in_progress
python3 task_manager.py update 1 completed

# View details
python3 task_manager.py view 1

# Search
python3 task_manager.py search "priority"

# Filter by status
python3 task_manager.py list completed

# Delete
python3 task_manager.py delete 3

# Verify persistence
python3 task_manager.py list
```

**Test 3: Error Cases**
```bash
# Invalid commands
python3 task_manager.py invalid
python3 task_manager.py add  # Missing title
python3 task_manager.py update 999 completed  # Invalid ID
python3 task_manager.py update 1 invalid_status  # Invalid status
python3 task_manager.py delete 999  # Invalid ID
```

**Test 4: Edge Cases**
```bash
# Empty list operations
rm tasks.json
python3 task_manager.py list  # Should show "No tasks found"
python3 task_manager.py search "test"  # Should show "No tasks found"

# Special characters
python3 task_manager.py add "Task with \"quotes\"" "Description with 'quotes'"
python3 task_manager.py view 1

# Very long input
python3 task_manager.py add "$(python3 -c 'print("A" * 1000)')" "Long description"
```

---

## Performance Considerations

### Expected Performance
- **File size**: 1000 tasks ≈ 100KB (very small)
- **Load time**: < 100ms for 1000 tasks
- **Save time**: < 100ms for 1000 tasks
- **Search**: O(n) linear scan - acceptable for expected sizes

### Scalability Limits
- Comfortable up to 10,000 tasks (1MB JSON file)
- Beyond that, consider database backend
- No optimization needed for educational use case

### Memory Usage
- All tasks loaded in memory: 1000 tasks ≈ 1MB RAM
- Negligible for modern systems
- No streaming needed

---

## Security Considerations

### File System
- Tasks stored in plaintext JSON (no encryption needed for MVP)
- File created with default permissions
- No handling of concurrent access (document as limitation)

### Input Validation
- No code injection risk (not using eval or exec)
- JSON library handles escaping automatically
- Command arguments treated as strings

### Known Limitations (Document in README)
- No concurrent access protection
- No backup/restore functionality
- No file locking mechanism
- Tasks stored in plaintext

---

## Future Enhancements (Out of Scope)

These are explicitly **not** part of the current implementation but could be considered for future versions:

1. **Database backend** (SQLite) for better scalability
2. **Due dates** with date parsing and validation
3. **Tags/categories** for better organization
4. **Task dependencies** (blocking relationships)
5. **Recurring tasks** (daily, weekly patterns)
6. **Export** to CSV, Markdown, or other formats
7. **Color-coded output** using ANSI escape codes
8. **Interactive mode** with menus and prompts
9. **Undo/redo** functionality
10. **File locking** for concurrent access safety

---

## Acceptance Criteria

Before considering the implementation complete, verify:

- [ ] All 6 user stories from spec can be completed successfully
- [ ] All functional requirements (FR-001 through FR-027) are implemented
- [ ] All edge cases from spec are handled gracefully
- [ ] README.md includes working examples for every command
- [ ] Code has docstrings for all classes and functions
- [ ] Manual testing of all test cases passes
- [ ] JSON file remains valid after any sequence of operations
- [ ] Error messages are clear and helpful
- [ ] Data persists correctly across application restarts
- [ ] No critical linting errors (pylint/flake8)

---

## Implementation Notes

### Code Style
- Follow PEP 8 Python style guide
- Use type hints for function signatures
- Keep functions focused and single-purpose
- Maximum function length: ~50 lines
- Use descriptive variable names

### Documentation
- Docstring for every class and method
- Inline comments for complex logic
- README with complete usage guide
- Comment any non-obvious design decisions

### Git Workflow
- Commit after each phase completion
- Clear commit messages describing changes
- Final commit before copying to task5 directory

---

*This implementation plan provides a complete roadmap for building the Task Manager CLI application according to spec-driven development principles.*

