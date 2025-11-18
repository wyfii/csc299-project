# Task Manager CLI

A simple command-line application for managing tasks, storing data in a JSON file. Built using Spec-Driven Development methodology with GitHub's Spec Kit.

## 🎯 Features

- **Add tasks** with title, description, and priority
- **List tasks** with optional status filtering
- **Search tasks** by title or description
- **View task details** with full information
- **Update task status** (pending, in_progress, completed, cancelled)
- **Delete tasks** when no longer needed
- **Persistent storage** using JSON file format

## 📋 Requirements

- Python 3.6 or higher (no external dependencies required)

## 🚀 Installation

No installation required! Just make sure you have Python 3 installed on your system.

To check your Python version:
```bash
python3 --version
```

## 📖 Usage

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
python3 task_manager.py add "Complete assignment" "CSC299 Task 5" high
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

## 🎬 Quick Start Example

Here's a complete workflow example:

```bash
# 1. Add some tasks
python3 task_manager.py add "Study for exam" "Chapters 1-5" high
python3 task_manager.py add "Submit assignment" "CSC299 Task 5" medium
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

## 💾 Data Storage

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

**Example:**
```json
[
    {
        "id": 1,
        "title": "Study for exam",
        "description": "Chapters 1-5",
        "priority": "high",
        "status": "in_progress",
        "created_at": "2025-11-18T10:30:00.123456",
        "completed_at": null
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

## ⚠️ Error Handling

The application includes error handling for:
- Invalid commands
- Missing required arguments
- Invalid task IDs
- Invalid status values
- File read/write errors
- Malformed JSON data

## 📝 Notes

- Task IDs are automatically assigned and increment from 1
- All timestamps are stored in ISO 8601 format
- The JSON file is pretty-printed with indentation for easy reading
- If the `tasks.json` file is missing or corrupted, the application will start with an empty task list

## 🔧 Troubleshooting

**Problem**: `python3` command not found  
**Solution**: Try using `python` instead, or install Python 3 from [python.org](https://python.org)

**Problem**: Permission denied  
**Solution**: Make the script executable: `chmod +x task_manager.py`

**Problem**: Tasks not saving  
**Solution**: Check that you have write permissions in the directory

## 🏗️ Development Methodology

This project was built using **Spec-Driven Development (SDD)** with GitHub's Spec Kit:

1. **Constitution**: Established project principles and development guidelines
2. **Specification**: Defined user stories and functional requirements
3. **Implementation Plan**: Created technical architecture and component design
4. **Task Breakdown**: Generated structured implementation tasks
5. **Implementation**: Built the application following the plan

### Project Documentation

The complete specification documents can be found in `.specify/specs/001-task-manager-cli/`:
- `spec.md` - Feature specification with user stories and requirements
- `plan.md` - Technical implementation plan and architecture
- `tasks.md` - Detailed task breakdown for implementation

The project constitution defining development principles is in `.specify/memory/constitution.md`.

## 📚 CSC299 Course Context

This Task Manager CLI is part of the CSC299 coursework (Task 5). It demonstrates:
- Command-line application development in Python
- File-based data persistence with JSON
- Error handling and input validation
- User-friendly CLI design
- Clean, maintainable code structure
- Comprehensive documentation

### Learning Objectives Met
- ✅ Understanding of basic data structures and algorithms
- ✅ File I/O operations and data serialization
- ✅ Command-line argument parsing
- ✅ Object-oriented programming principles
- ✅ Error handling and edge case management
- ✅ Code documentation and user documentation

## 👤 Author

Created as part of CSC299 coursework using Spec-Driven Development methodology.

## 📄 License

This is a student project for educational purposes (CSC299).

---

**Built with GitHub Spec Kit** - A toolkit for Spec-Driven Development  
Learn more: https://github.com/github/spec-kit

