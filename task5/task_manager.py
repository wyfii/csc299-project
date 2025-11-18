#!/usr/bin/env python3
"""
Task Manager CLI - A simple command-line task management application

This application provides a command-line interface for managing tasks with
persistent JSON storage. It supports creating, listing, viewing, updating,
deleting, and searching tasks.

Usage:
    python3 task_manager.py <command> [arguments]

Commands:
    add <title> [description] [priority]    Add new task
    list [status]                           List tasks, optionally filtered
    view <id>                               View task details
    update <id> <status>                    Update task status
    delete <id>                             Delete task
    search <query>                          Search tasks
    help                                    Show help message

Author: CSC299 Student
Date: November 18, 2025
"""

import json
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any


class Task:
    """
    Represents a single task with all its attributes.
    
    Attributes:
        id (int): Unique identifier for the task
        title (str): Task title (required, non-empty)
        description (str): Optional task description
        priority (str): Priority level (low, medium, high)
        status (str): Current status (pending, in_progress, completed, cancelled)
        created_at (str): ISO 8601 timestamp of creation
        completed_at (Optional[str]): ISO 8601 timestamp of completion, None if not completed
    """
    
    VALID_PRIORITIES = ["low", "medium", "high"]
    VALID_STATUSES = ["pending", "in_progress", "completed", "cancelled"]
    
    def __init__(
        self,
        id: int,
        title: str,
        description: str = "",
        priority: str = "medium",
        status: str = "pending",
        created_at: Optional[str] = None,
        completed_at: Optional[str] = None
    ):
        """
        Initialize a Task instance.
        
        Args:
            id: Unique task identifier
            title: Task title (required)
            description: Task description (optional)
            priority: Priority level (default: medium)
            status: Task status (default: pending)
            created_at: Creation timestamp (auto-generated if not provided)
            completed_at: Completion timestamp (None for non-completed tasks)
            
        Raises:
            ValueError: If title is empty, or priority/status are invalid
        """
        if not title or not title.strip():
            raise ValueError("Task title cannot be empty")
        
        if priority not in self.VALID_PRIORITIES:
            raise ValueError(f"Priority must be one of: {', '.join(self.VALID_PRIORITIES)}")
        
        if status not in self.VALID_STATUSES:
            raise ValueError(f"Status must be one of: {', '.join(self.VALID_STATUSES)}")
        
        self.id = id
        self.title = title.strip()
        self.description = description.strip() if description else ""
        self.priority = priority
        self.status = status
        self.created_at = created_at or datetime.now().isoformat()
        self.completed_at = completed_at
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert task to dictionary for JSON serialization.
        
        Returns:
            Dictionary representation of the task
        """
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "priority": self.priority,
            "status": self.status,
            "created_at": self.created_at,
            "completed_at": self.completed_at
        }
    
    @staticmethod
    def from_dict(data: Dict[str, Any]) -> 'Task':
        """
        Create a Task instance from a dictionary.
        
        Args:
            data: Dictionary containing task data
            
        Returns:
            Task instance
        """
        return Task(
            id=data["id"],
            title=data["title"],
            description=data.get("description", ""),
            priority=data.get("priority", "medium"),
            status=data.get("status", "pending"),
            created_at=data.get("created_at"),
            completed_at=data.get("completed_at")
        )
    
    def __str__(self) -> str:
        """
        Format task for list view display.
        
        Returns:
            Formatted string representation
        """
        priority_symbol = {
            "high": "!!!",
            "medium": "!! ",
            "low": "!  "
        }
        status_symbol = {
            "pending": "[ ]",
            "in_progress": "[→]",
            "completed": "[✓]",
            "cancelled": "[✗]"
        }
        
        return (
            f"{status_symbol[self.status]} "
            f"#{self.id:<3} "
            f"{priority_symbol[self.priority]} "
            f"{self.title}"
        )
    
    def display_full(self) -> str:
        """
        Format task with all details for view command.
        
        Returns:
            Detailed formatted string
        """
        lines = [
            "=" * 60,
            f"Task #{self.id}",
            "=" * 60,
            f"Title:        {self.title}",
            f"Description:  {self.description if self.description else '(none)'}",
            f"Priority:     {self.priority.upper()}",
            f"Status:       {self.status.replace('_', ' ').upper()}",
            f"Created:      {self.created_at}",
        ]
        
        if self.completed_at:
            lines.append(f"Completed:    {self.completed_at}")
        
        lines.append("=" * 60)
        return "\n".join(lines)


class TaskManager:
    """
    Manages the collection of tasks and handles file I/O operations.
    
    Attributes:
        filename (str): Path to JSON storage file
        tasks (List[Task]): List of all tasks
    """
    
    def __init__(self, filename: str = "tasks.json"):
        """
        Initialize TaskManager and load existing tasks.
        
        Args:
            filename: Path to JSON storage file (default: tasks.json)
        """
        self.filename = filename
        self.tasks: List[Task] = []
        self.load_tasks()
    
    def load_tasks(self) -> None:
        """
        Load tasks from JSON file.
        
        Handles missing or corrupted files gracefully by starting with
        an empty task list.
        """
        try:
            with open(self.filename, 'r') as f:
                data = json.load(f)
                self.tasks = [Task.from_dict(task_dict) for task_dict in data]
        except FileNotFoundError:
            # First run - no file exists yet
            self.tasks = []
        except json.JSONDecodeError:
            # Corrupted file
            print(f"Warning: {self.filename} is corrupted. Starting with empty task list.")
            self.tasks = []
        except PermissionError:
            # No file access
            print(f"Error: Cannot read {self.filename} - check file permissions")
            sys.exit(1)
    
    def save_tasks(self) -> None:
        """
        Save all tasks to JSON file.
        
        Writes tasks with proper formatting for human readability.
        """
        try:
            with open(self.filename, 'w') as f:
                data = [task.to_dict() for task in self.tasks]
                json.dump(data, f, indent=4)
                f.write('\n')  # Add trailing newline
        except PermissionError:
            print(f"Error: Cannot write to {self.filename} - check file permissions")
            sys.exit(1)
        except Exception as e:
            print(f"Error saving tasks: {e}")
            sys.exit(1)
    
    def get_next_id(self) -> int:
        """
        Generate the next available task ID.
        
        Returns:
            Next available ID (1 if no tasks exist)
        """
        if not self.tasks:
            return 1
        return max(task.id for task in self.tasks) + 1
    
    def add_task(
        self,
        title: str,
        description: str = "",
        priority: str = "medium"
    ) -> Task:
        """
        Create and add a new task.
        
        Args:
            title: Task title (required)
            description: Task description (optional)
            priority: Priority level (default: medium)
            
        Returns:
            The newly created Task
            
        Raises:
            ValueError: If validation fails
        """
        task_id = self.get_next_id()
        task = Task(
            id=task_id,
            title=title,
            description=description,
            priority=priority
        )
        self.tasks.append(task)
        self.save_tasks()
        return task
    
    def get_task(self, task_id: int) -> Optional[Task]:
        """
        Retrieve a task by its ID.
        
        Args:
            task_id: The ID to search for
            
        Returns:
            Task object if found, None otherwise
        """
        for task in self.tasks:
            if task.id == task_id:
                return task
        return None
    
    def list_tasks(self, status_filter: Optional[str] = None) -> List[Task]:
        """
        Get all tasks, optionally filtered by status.
        
        Args:
            status_filter: Optional status to filter by
            
        Returns:
            List of Task objects
        """
        if status_filter:
            return [task for task in self.tasks if task.status == status_filter]
        return self.tasks
    
    def update_status(self, task_id: int, new_status: str) -> bool:
        """
        Update the status of a task.
        
        Args:
            task_id: ID of task to update
            new_status: New status value
            
        Returns:
            True if successful, False if task not found
            
        Raises:
            ValueError: If status is invalid
        """
        if new_status not in Task.VALID_STATUSES:
            raise ValueError(
                f"Invalid status '{new_status}'. "
                f"Valid options: {', '.join(Task.VALID_STATUSES)}"
            )
        
        task = self.get_task(task_id)
        if not task:
            return False
        
        task.status = new_status
        
        # Update completed_at timestamp
        if new_status == "completed":
            task.completed_at = datetime.now().isoformat()
        else:
            task.completed_at = None
        
        self.save_tasks()
        return True
    
    def delete_task(self, task_id: int) -> bool:
        """
        Remove a task from the collection.
        
        Args:
            task_id: ID of task to delete
            
        Returns:
            True if successful, False if task not found
        """
        task = self.get_task(task_id)
        if not task:
            return False
        
        self.tasks.remove(task)
        self.save_tasks()
        return True
    
    def search_tasks(self, query: str) -> List[Task]:
        """
        Find tasks matching a search query.
        
        Searches in both title and description (case-insensitive).
        
        Args:
            query: Search term
            
        Returns:
            List of matching Task objects
        """
        query_lower = query.lower()
        results = []
        
        for task in self.tasks:
            if (query_lower in task.title.lower() or
                query_lower in task.description.lower()):
                results.append(task)
        
        return results


def print_help():
    """Display comprehensive help message with all commands and examples."""
    help_text = """
╔══════════════════════════════════════════════════════════════════════════════╗
║                        TASK MANAGER CLI - HELP                               ║
╚══════════════════════════════════════════════════════════════════════════════╝

USAGE:
    python3 task_manager.py <command> [arguments]

COMMANDS:

    add <title> [description] [priority]
        Add a new task
        
        Arguments:
            title       - Required: Task title
            description - Optional: Additional details
            priority    - Optional: low, medium, or high (default: medium)
        
        Examples:
            python3 task_manager.py add "Buy groceries"
            python3 task_manager.py add "Study for exam" "Chapters 1-5" high

    list [status]
        List all tasks, optionally filtered by status
        
        Arguments:
            status - Optional: pending, in_progress, completed, or cancelled
        
        Examples:
            python3 task_manager.py list
            python3 task_manager.py list pending
            python3 task_manager.py list completed

    view <id>
        View detailed information about a specific task
        
        Arguments:
            id - Required: Task ID number
        
        Example:
            python3 task_manager.py view 1

    update <id> <status>
        Update the status of a task
        
        Arguments:
            id     - Required: Task ID number
            status - Required: pending, in_progress, completed, or cancelled
        
        Examples:
            python3 task_manager.py update 1 in_progress
            python3 task_manager.py update 1 completed

    delete <id>
        Delete a task permanently
        
        Arguments:
            id - Required: Task ID number
        
        Example:
            python3 task_manager.py delete 1

    search <query>
        Search for tasks by keyword (searches title and description)
        
        Arguments:
            query - Required: Search term
        
        Examples:
            python3 task_manager.py search "exam"
            python3 task_manager.py search "groceries"

    help
        Display this help message

PRIORITY LEVELS:
    low     - Not urgent tasks
    medium  - Standard priority (default)
    high    - Urgent or important tasks

TASK STATUSES:
    pending     - Task has not been started yet (default)
    in_progress - Task is currently being worked on
    completed   - Task has been finished
    cancelled   - Task has been cancelled

DATA STORAGE:
    Tasks are stored in 'tasks.json' in the current directory.
    The file is automatically created when you add your first task.

╚══════════════════════════════════════════════════════════════════════════════╝
"""
    print(help_text)


def handle_add(manager: TaskManager, args: List[str]):
    """Handle the 'add' command."""
    if len(args) < 1:
        print("Error: Missing required argument 'title'")
        print("Usage: python3 task_manager.py add <title> [description] [priority]")
        print("Example: python3 task_manager.py add \"Buy groceries\" \"Milk, eggs\" high")
        return
    
    title = args[0]
    description = args[1] if len(args) > 1 else ""
    priority = args[2] if len(args) > 2 else "medium"
    
    # Validate priority
    if priority not in Task.VALID_PRIORITIES:
        print(f"Error: Invalid priority '{priority}'")
        print(f"Valid options: {', '.join(Task.VALID_PRIORITIES)}")
        print("Defaulting to 'medium' priority")
        priority = "medium"
    
    try:
        task = manager.add_task(title, description, priority)
        print(f"✓ Task added successfully!")
        print(f"  ID: {task.id}")
        print(f"  Title: {task.title}")
        print(f"  Priority: {task.priority}")
    except ValueError as e:
        print(f"Error: {e}")


def handle_list(manager: TaskManager, args: List[str]):
    """Handle the 'list' command."""
    status_filter = None
    
    if len(args) > 0:
        status_filter = args[0]
        if status_filter not in Task.VALID_STATUSES:
            print(f"Error: Invalid status filter '{status_filter}'")
            print(f"Valid options: {', '.join(Task.VALID_STATUSES)}")
            return
    
    tasks = manager.list_tasks(status_filter)
    
    if not tasks:
        if status_filter:
            print(f"No tasks found with status '{status_filter}'")
        else:
            print("No tasks found. Add one with: python3 task_manager.py add <title>")
        return
    
    # Print header
    filter_text = f" (filtered by: {status_filter})" if status_filter else ""
    print(f"\n{'='*60}")
    print(f"TASKS{filter_text}")
    print(f"{'='*60}\n")
    
    # Print tasks
    for task in tasks:
        print(task)
    
    # Print footer
    print(f"\n{'='*60}")
    print(f"Total: {len(tasks)} task(s)")
    print(f"{'='*60}\n")


def handle_view(manager: TaskManager, args: List[str]):
    """Handle the 'view' command."""
    if len(args) < 1:
        print("Error: Missing required argument 'id'")
        print("Usage: python3 task_manager.py view <id>")
        print("Example: python3 task_manager.py view 1")
        return
    
    try:
        task_id = int(args[0])
    except ValueError:
        print(f"Error: Invalid task ID '{args[0]}'. ID must be a number.")
        return
    
    task = manager.get_task(task_id)
    
    if not task:
        print(f"Error: Task with ID {task_id} not found")
        print("Use 'python3 task_manager.py list' to see all tasks")
        return
    
    print()
    print(task.display_full())
    print()


def handle_update(manager: TaskManager, args: List[str]):
    """Handle the 'update' command."""
    if len(args) < 2:
        print("Error: Missing required arguments")
        print("Usage: python3 task_manager.py update <id> <status>")
        print(f"Valid statuses: {', '.join(Task.VALID_STATUSES)}")
        print("Example: python3 task_manager.py update 1 in_progress")
        return
    
    try:
        task_id = int(args[0])
    except ValueError:
        print(f"Error: Invalid task ID '{args[0]}'. ID must be a number.")
        return
    
    new_status = args[1]
    
    try:
        success = manager.update_status(task_id, new_status)
        
        if success:
            print(f"✓ Task #{task_id} status updated to '{new_status}'")
            if new_status == "completed":
                print("  Completion timestamp recorded")
        else:
            print(f"Error: Task with ID {task_id} not found")
            print("Use 'python3 task_manager.py list' to see all tasks")
    
    except ValueError as e:
        print(f"Error: {e}")


def handle_delete(manager: TaskManager, args: List[str]):
    """Handle the 'delete' command."""
    if len(args) < 1:
        print("Error: Missing required argument 'id'")
        print("Usage: python3 task_manager.py delete <id>")
        print("Example: python3 task_manager.py delete 1")
        return
    
    try:
        task_id = int(args[0])
    except ValueError:
        print(f"Error: Invalid task ID '{args[0]}'. ID must be a number.")
        return
    
    success = manager.delete_task(task_id)
    
    if success:
        print(f"✓ Task #{task_id} deleted successfully")
    else:
        print(f"Error: Task with ID {task_id} not found")
        print("Use 'python3 task_manager.py list' to see all tasks")


def handle_search(manager: TaskManager, args: List[str]):
    """Handle the 'search' command."""
    if len(args) < 1:
        print("Error: Missing required argument 'query'")
        print("Usage: python3 task_manager.py search <query>")
        print("Example: python3 task_manager.py search \"exam\"")
        return
    
    # Join all arguments into a single query string
    query = " ".join(args)
    
    results = manager.search_tasks(query)
    
    if not results:
        print(f"No tasks found matching '{query}'")
        print("Try a different search term or use 'list' to see all tasks")
        return
    
    # Print header
    print(f"\n{'='*60}")
    print(f"SEARCH RESULTS for '{query}'")
    print(f"{'='*60}\n")
    
    # Print results
    for task in results:
        print(task)
    
    # Print footer
    print(f"\n{'='*60}")
    print(f"Found {len(results)} matching task(s)")
    print(f"{'='*60}\n")


def main():
    """Main entry point - parse arguments and dispatch to command handlers."""
    if len(sys.argv) < 2:
        print("Error: No command specified")
        print("Use 'python3 task_manager.py help' for usage information")
        return
    
    command = sys.argv[1].lower()
    args = sys.argv[2:]
    
    # Handle help command without creating TaskManager
    if command == "help":
        print_help()
        return
    
    # Create TaskManager for all other commands
    manager = TaskManager()
    
    # Route to appropriate handler
    if command == "add":
        handle_add(manager, args)
    elif command == "list":
        handle_list(manager, args)
    elif command == "view":
        handle_view(manager, args)
    elif command == "update":
        handle_update(manager, args)
    elif command == "delete":
        handle_delete(manager, args)
    elif command == "search":
        handle_search(manager, args)
    else:
        print(f"Error: Unknown command '{command}'")
        print("Use 'python3 task_manager.py help' for usage information")


if __name__ == "__main__":
    main()

