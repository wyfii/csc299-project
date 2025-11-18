# Task Manager CLI

A simple command-line application for managing tasks, storing data in a JSON file.

## Features

- **Add tasks** with title, description, and priority
- **List tasks** with optional status filtering
- **Search tasks** by title or description
- **View task details** with full information
- **Update task status** (pending, in_progress, completed, cancelled)
- **Delete tasks** when no longer needed
- **Persistent storage** using JSON file format

## Requirements

- Python 3.6 or higher (no external dependencies required)

## Installation

No installation required! Just make sure you have Python 3 installed on your system.

To check your Python version:
```bash
python3 --version
```

## Usage

All commands follow this pattern:
```bash
python3 task_manager.py <command> [arguments]
```

### Available Commands

#### 1. Add a Task
```bash
python3 task_manager.py add <title> [description] [priority]
```
- **title**: Required - The task title
- **description**: Optional - Additional details about the task
- **priority**: Optional - Can be `low`, `medium`, or `high` (default: `medium`)

**Examples:**
```bash
# Simple task
python3 task_manager.py add "Buy groceries"

# Task with description
python3 task_manager.py add "Buy groceries" "Milk, eggs, bread"

# Task with description and priority
python3 task_manager.py add "Complete assignment" "CSC299 Task 1" high
```

#### 2. List Tasks
```bash
python3 task_manager.py list [status]
```
- **status**: Optional - Filter by status (`pending`, `in_progress`, `completed`, `cancelled`)

**Examples:**
```bash
# List all tasks
python3 task_manager.py list

# List only pending tasks
python3 task_manager.py list pending

# List completed tasks
python3 task_manager.py list completed
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
```

#### 6. Delete a Task
```bash
python3 task_manager.py delete <task_id>
```
- **task_id**: Required - The ID of the task to delete

**Example:**
```bash
python3 task_manager.py delete 1
```

#### 7. Get Help
```bash
python3 task_manager.py help
```

## Quick Start Example

Here's a complete workflow example:

```bash
# 1. Add some tasks
python3 task_manager.py add "Study for exam" "Chapter 1-5" high
python3 task_manager.py add "Submit assignment" "Due next week" medium
python3 task_manager.py add "Buy textbook" "" low

# 2. List all tasks
python3 task_manager.py list

# 3. Search for a specific task
python3 task_manager.py search "exam"

# 4. View detailed information
python3 task_manager.py view 1

# 5. Update task status
python3 task_manager.py update 1 in_progress

# 6. Mark task as completed
python3 task_manager.py update 1 completed

# 7. List only completed tasks
python3 task_manager.py list completed

# 8. Delete a task
python3 task_manager.py delete 3
```

## Data Storage

Tasks are stored in a `tasks.json` file in the same directory as the script. This file is automatically created when you add your first task.

### JSON Structure
Each task contains:
- `id`: Unique identifier
- `title`: Task title
- `description`: Task description
- `priority`: Priority level (low, medium, high)
- `status`: Current status (pending, in_progress, completed, cancelled)
- `created_at`: ISO format timestamp of creation
- `completed_at`: ISO format timestamp of completion (null if not completed)

## Task Statuses

The application supports four task statuses:
- **pending**: Task has not been started yet
- **in_progress**: Task is currently being worked on
- **completed**: Task has been finished
- **cancelled**: Task has been cancelled

## Priority Levels

Tasks can have three priority levels:
- **low**: Not urgent
- **medium**: Standard priority (default)
- **high**: Urgent or important

## Error Handling

The application includes error handling for:
- Invalid commands
- Missing required arguments
- Invalid task IDs
- Invalid status values
- File read/write errors
- Malformed JSON data

## Notes

- Task IDs are automatically assigned and increment from 1
- All timestamps are stored in ISO 8601 format
- The JSON file is pretty-printed with indentation for easy reading
- If the `tasks.json` file is missing or corrupted, the application will start with an empty task list

## Troubleshooting

**Problem**: `python3` command not found  
**Solution**: Try using `python` instead, or install Python 3 from [python.org](https://python.org)

**Problem**: Permission denied  
**Solution**: Make the script executable: `chmod +x task_manager.py`

**Problem**: Tasks not saving  
**Solution**: Check that you have write permissions in the directory

## License

This is a student project for CSC299.

## Author

Created as part of CSC299 coursework.

