# Task Manager CLI - Enhanced Version

A feature-rich command-line application for managing tasks with persistent JSON storage. This enhanced version includes due dates, tags, statistics, CSV export, and more!

## 🌟 Features

### Core Features
- **Add tasks** with title, description, and priority
- **List tasks** with status filtering and multiple sort options
- **Search tasks** by title or description
- **View task details** with full information
- **Update task status** (pending, in_progress, completed, cancelled)
- **Edit tasks** - modify any task field after creation
- **Delete tasks** when no longer needed

### Enhanced Features
- **Due dates** - Set deadlines and get overdue warnings ⚠
- **Tags** - Organize tasks with custom tags
- **Statistics** - View comprehensive task analytics
- **CSV Export** - Export your tasks for use in spreadsheets
- **Sort options** - Sort by priority, due date, or creation date
- **Clear completed** - Bulk remove completed tasks
- **Overdue detection** - Visual indicators for overdue tasks

### Data Management
- **Persistent storage** using JSON file format
- **Automatic saving** after every operation
- **Data validation** for all inputs
- **Error handling** for file operations

## 📋 Requirements

- Python 3.6 or higher (no external dependencies required)

## 🚀 Installation

No installation required! Just make sure you have Python 3 installed on your system.

To check your Python version:
```bash
python3 --version
```

## 💻 Usage

All commands follow this pattern:
```bash
python3 task_manager.py <command> [arguments] [options]
```

### Available Commands

#### 1. Add a Task
```bash
python3 task_manager.py add <title> [description] [priority] [--due YYYY-MM-DD] [--tags tag1,tag2]
```
- **title**: Required - The task title
- **description**: Optional - Additional details about the task
- **priority**: Optional - Can be `low`, `medium`, or `high` (default: `medium`)
- **--due**: Optional - Due date in YYYY-MM-DD format
- **--tags**: Optional - Comma-separated list of tags

**Examples:**
```bash
# Simple task
python3 task_manager.py add "Buy groceries"

# Task with description and priority
python3 task_manager.py add "Complete assignment" "CSC299 Task 2" high

# Task with due date and tags
python3 task_manager.py add "Client meeting" "Discuss Q4 goals" high --due 2025-11-10 --tags work,urgent

# Task with everything
python3 task_manager.py add "Submit proposal" "Project budget and timeline" high --due 2025-11-15 --tags work,deadline,client
```

#### 2. List Tasks
```bash
python3 task_manager.py list [status] [--sort-by FIELD]
```
- **status**: Optional - Filter by status (`pending`, `in_progress`, `completed`, `cancelled`)
- **--sort-by**: Optional - Sort by `id` (default), `priority`, `due_date`, or `created`

**Examples:**
```bash
# List all tasks
python3 task_manager.py list

# List only pending tasks
python3 task_manager.py list pending

# List tasks sorted by priority
python3 task_manager.py list --sort-by priority

# List completed tasks sorted by due date
python3 task_manager.py list completed --sort-by due_date
```

#### 3. Search Tasks
```bash
python3 task_manager.py search <query>
```
- **query**: Required - Search term to find in task titles or descriptions

**Examples:**
```bash
python3 task_manager.py search "groceries"
python3 task_manager.py search "assignment"
python3 task_manager.py search "client"
```

#### 4. View Task Details
```bash
python3 task_manager.py view <task_id>
```
- **task_id**: Required - The ID of the task to view

**Example:**
```bash
python3 task_manager.py view 1
```

#### 5. Update Task Status
```bash
python3 task_manager.py update <task_id> <status>
```
- **task_id**: Required - The ID of the task to update
- **status**: Required - New status (`pending`, `in_progress`, `completed`, `cancelled`)

**Examples:**
```bash
python3 task_manager.py update 1 in_progress
python3 task_manager.py update 1 completed
python3 task_manager.py update 2 cancelled
```

#### 6. Edit a Task
```bash
python3 task_manager.py edit <task_id> [--title TITLE] [--description DESC] [--priority PRIORITY] [--due DATE] [--tags tag1,tag2]
```
- **task_id**: Required - The ID of the task to edit
- **--title**: Optional - New title
- **--description**: Optional - New description
- **--priority**: Optional - New priority
- **--due**: Optional - New due date
- **--tags**: Optional - New tags (replaces existing tags)

**Examples:**
```bash
# Change title
python3 task_manager.py edit 1 --title "Updated task title"

# Change priority and due date
python3 task_manager.py edit 1 --priority high --due 2025-11-20

# Update multiple fields
python3 task_manager.py edit 1 --title "New title" --description "New description" --tags urgent,important
```

#### 7. Delete a Task
```bash
python3 task_manager.py delete <task_id>
```
- **task_id**: Required - The ID of the task to delete

**Example:**
```bash
python3 task_manager.py delete 1
```

#### 8. View Statistics
```bash
python3 task_manager.py stats
```

Displays comprehensive statistics including:
- Total task count
- Tasks by status (with percentages)
- Tasks by priority (with percentages)
- Overdue task count
- Active tags

**Example:**
```bash
python3 task_manager.py stats
```

#### 9. Export to CSV
```bash
python3 task_manager.py export [filename]
```
- **filename**: Optional - Output filename (default: `tasks_export.csv`)

**Examples:**
```bash
# Export to default file
python3 task_manager.py export

# Export to custom file
python3 task_manager.py export my_tasks_2025.csv
```

#### 10. Clear Completed Tasks
```bash
python3 task_manager.py clear-completed
```

Removes all tasks with status `completed`.

**Example:**
```bash
python3 task_manager.py clear-completed
```

#### 11. Get Help
```bash
python3 task_manager.py help
```

## 📚 Complete Workflow Example

Here's a realistic workflow showing all the features:

```bash
# 1. Add some tasks with various attributes
python3 task_manager.py add "Study for exam" "Chapters 1-5" high --due 2025-11-10 --tags school,urgent
python3 task_manager.py add "Submit assignment" "CSC299 Task 2" high --due 2025-11-15 --tags school,deadline
python3 task_manager.py add "Buy textbook" "" medium --tags school,shopping
python3 task_manager.py add "Gym workout" "Cardio and weights" low --tags health,personal
python3 task_manager.py add "Team meeting" "Sprint planning" medium --due 2025-11-08 --tags work,meeting

# 2. List all tasks to see what we have
python3 task_manager.py list

# 3. List tasks sorted by priority to see what's most important
python3 task_manager.py list --sort-by priority

# 4. List tasks sorted by due date to see deadlines
python3 task_manager.py list --sort-by due_date

# 5. Start working on the most urgent task
python3 task_manager.py update 1 in_progress

# 6. Search for school-related tasks
python3 task_manager.py search "school"

# 7. View detailed information about a task
python3 task_manager.py view 1

# 8. Edit a task to add more details
python3 task_manager.py edit 3 --description "Introduction to Algorithms textbook" --priority high

# 9. Complete a task
python3 task_manager.py update 1 completed

# 10. View statistics
python3 task_manager.py stats

# 11. List only pending tasks
python3 task_manager.py list pending

# 12. Export tasks to CSV for backup
python3 task_manager.py export my_backup.csv

# 13. After completing several tasks, clean up
python3 task_manager.py clear-completed

# 14. Delete a task that's no longer needed
python3 task_manager.py delete 4
```

## 💾 Data Storage

Tasks are stored in a `tasks.json` file in the same directory as the script. This file is automatically created when you add your first task.

### JSON Structure
Each task contains:
- `id`: Unique identifier (auto-incremented)
- `title`: Task title
- `description`: Task description
- `priority`: Priority level (low, medium, high)
- `status`: Current status (pending, in_progress, completed, cancelled)
- `created_at`: ISO format timestamp of creation
- `completed_at`: ISO format timestamp of completion (null if not completed)
- `due_date`: Due date in YYYY-MM-DD format (null if not set)
- `tags`: Array of tag strings

### Example JSON:
```json
[
  {
    "id": 1,
    "title": "Complete assignment",
    "description": "CSC299 Task 2",
    "priority": "high",
    "status": "in_progress",
    "created_at": "2025-11-03T10:30:00.123456",
    "completed_at": null,
    "due_date": "2025-11-15",
    "tags": ["school", "deadline"]
  }
]
```

## 📊 Task Statuses

The application supports four task statuses:
- **pending**: Task has not been started yet (default)
- **in_progress**: Task is currently being worked on
- **completed**: Task has been finished
- **cancelled**: Task has been cancelled

## 🎯 Priority Levels

Tasks can have three priority levels:
- **low**: Not urgent
- **medium**: Standard priority (default)
- **high**: Urgent or important

When listing with `--sort-by priority`, tasks are ordered: high → medium → low

## 🏷️ Working with Tags

Tags help you organize and categorize your tasks:
- Add multiple tags when creating a task: `--tags work,urgent,client`
- Tags are case-sensitive
- Use tags in combination with search to find related tasks
- View all active tags in the statistics command

**Tag Best Practices:**
- Use consistent naming (e.g., always use `work` not sometimes `Work`)
- Keep tags short and descriptive
- Common useful tags: `urgent`, `work`, `personal`, `school`, `deadline`, `meeting`, `shopping`

## ⚠️ Overdue Task Detection

Tasks with due dates in the past (and not marked as completed) are automatically detected:
- Listed with a ⚠ warning symbol
- Shown in the statistics summary
- Highlighted when viewing task details

## 🧪 Testing

The project includes comprehensive unit tests covering all functionality.

### Running Tests

```bash
# Run all tests
python3 test_task_manager.py

# Or if you have pytest installed
python3 -m pytest test_task_manager.py -v
```

### Test Coverage

The test suite includes 24+ tests covering:
- Task creation and initialization
- CRUD operations (Create, Read, Update, Delete)
- Status updates and validation
- Task editing and field updates
- Due date functionality
- Tags management
- Search and filtering
- Sorting operations
- Statistics calculation
- CSV export
- Data persistence
- Error handling
- Edge cases

## 🔧 Error Handling

The application includes comprehensive error handling for:
- Invalid commands
- Missing required arguments
- Invalid task IDs
- Invalid status values
- Invalid priority values
- File read/write errors
- Malformed JSON data
- Empty task lists

## 📝 Tips and Best Practices

1. **Regular backups**: Use `export` command regularly to backup your tasks
2. **Use tags consistently**: Establish a tagging system and stick to it
3. **Set due dates**: Add due dates to time-sensitive tasks to track deadlines
4. **Check statistics**: Run `stats` command to get an overview of your productivity
5. **Clean up regularly**: Use `clear-completed` to remove old completed tasks
6. **Use sorting**: Leverage `--sort-by` to view tasks in different orders
7. **Descriptive titles**: Use clear, actionable titles for better task management
8. **Update status**: Keep task statuses current for accurate tracking

## 🐛 Troubleshooting

**Problem**: `python3` command not found  
**Solution**: Try using `python` instead, or install Python 3 from [python.org](https://python.org)

**Problem**: Permission denied  
**Solution**: Make the script executable: `chmod +x task_manager.py`

**Problem**: Tasks not saving  
**Solution**: Check that you have write permissions in the directory

**Problem**: "Error loading tasks" message  
**Solution**: The `tasks.json` file may be corrupted. You can delete it to start fresh, or restore from a CSV export

**Problem**: Dates not sorting correctly  
**Solution**: Ensure due dates are in YYYY-MM-DD format

## 🎓 Use Cases

### For Students
- Track assignments and deadlines
- Organize study sessions
- Manage group projects
- Tag by course or subject

### For Professionals
- Manage work projects
- Track meetings and deadlines
- Organize client tasks
- Coordinate team activities

### For Personal Life
- Shopping lists
- Household chores
- Fitness goals
- Hobby projects

## 📄 License

This is a student project for CSC299.

## 👨‍💻 Development

### Project Structure
```
task2/
├── task_manager.py       # Main application
├── test_task_manager.py  # Unit tests
├── README.md            # This file
└── tasks.json           # Data file (created automatically)
```

### Future Enhancement Ideas
- Recurring tasks
- Task dependencies
- Multiple JSON files/projects
- Color-coded output
- Task reminders
- Subtasks
- Time tracking
- Task notes/comments

## 🙏 Acknowledgments

Created as part of CSC299 coursework, enhanced with features inspired by modern task management tools like Notion, Todoist, and Things.

---

**Version**: 2.0 (Enhanced)  
**Last Updated**: November 3, 2025

For questions or issues, please refer to the course materials or contact your instructor.
