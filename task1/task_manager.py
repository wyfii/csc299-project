#!/usr/bin/env python3
"""
Command-line Task Manager
A simple CLI application to store, list, and search tasks in a JSON file.
"""

import json
import os
import sys
from datetime import datetime
from typing import List, Dict, Optional


class TaskManager:
    """Manages tasks stored in a JSON file."""
    
    def __init__(self, data_file: str = "tasks.json"):
        """Initialize the task manager with a data file."""
        self.data_file = data_file
        self.tasks = self._load_tasks()
    
    def _load_tasks(self) -> List[Dict]:
        """Load tasks from the JSON file."""
        if not os.path.exists(self.data_file):
            return []
        
        try:
            with open(self.data_file, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error loading tasks: {e}")
            return []
    
    def _save_tasks(self) -> bool:
        """Save tasks to the JSON file."""
        try:
            with open(self.data_file, 'w') as f:
                json.dump(self.tasks, f, indent=2)
            return True
        except IOError as e:
            print(f"Error saving tasks: {e}")
            return False
    
    def add_task(self, title: str, description: str = "", priority: str = "medium") -> None:
        """Add a new task."""
        task = {
            "id": self._get_next_id(),
            "title": title,
            "description": description,
            "priority": priority.lower(),
            "status": "pending",
            "created_at": datetime.now().isoformat(),
            "completed_at": None
        }
        self.tasks.append(task)
        if self._save_tasks():
            print(f"✓ Task added successfully (ID: {task['id']})")
        else:
            print("✗ Failed to save task")
    
    def _get_next_id(self) -> int:
        """Get the next available task ID."""
        if not self.tasks:
            return 1
        return max(task['id'] for task in self.tasks) + 1
    
    def list_tasks(self, status_filter: Optional[str] = None) -> None:
        """List all tasks, optionally filtered by status."""
        filtered_tasks = self.tasks
        
        if status_filter:
            filtered_tasks = [t for t in self.tasks if t['status'] == status_filter.lower()]
        
        if not filtered_tasks:
            print("No tasks found.")
            return
        
        print(f"\n{'ID':<5} {'Title':<30} {'Priority':<10} {'Status':<10} {'Created':<20}")
        print("-" * 85)
        
        for task in filtered_tasks:
            created = datetime.fromisoformat(task['created_at']).strftime('%Y-%m-%d %H:%M')
            print(f"{task['id']:<5} {task['title'][:29]:<30} {task['priority']:<10} {task['status']:<10} {created:<20}")
        
        print(f"\nTotal: {len(filtered_tasks)} task(s)")
    
    def search_tasks(self, query: str) -> None:
        """Search tasks by title or description."""
        query_lower = query.lower()
        results = [
            task for task in self.tasks
            if query_lower in task['title'].lower() or query_lower in task['description'].lower()
        ]
        
        if not results:
            print(f"No tasks found matching '{query}'")
            return
        
        print(f"\nSearch results for '{query}':")
        print(f"\n{'ID':<5} {'Title':<30} {'Priority':<10} {'Status':<10}")
        print("-" * 65)
        
        for task in results:
            print(f"{task['id']:<5} {task['title'][:29]:<30} {task['priority']:<10} {task['status']:<10}")
        
        print(f"\nFound: {len(results)} task(s)")
    
    def view_task(self, task_id: int) -> None:
        """View detailed information about a specific task."""
        task = self._find_task(task_id)
        if not task:
            print(f"Task with ID {task_id} not found.")
            return
        
        print(f"\n{'=' * 60}")
        print(f"Task ID: {task['id']}")
        print(f"Title: {task['title']}")
        print(f"Description: {task['description'] or '(none)'}")
        print(f"Priority: {task['priority']}")
        print(f"Status: {task['status']}")
        print(f"Created: {datetime.fromisoformat(task['created_at']).strftime('%Y-%m-%d %H:%M:%S')}")
        if task['completed_at']:
            print(f"Completed: {datetime.fromisoformat(task['completed_at']).strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'=' * 60}\n")
    
    def _find_task(self, task_id: int) -> Optional[Dict]:
        """Find a task by ID."""
        for task in self.tasks:
            if task['id'] == task_id:
                return task
        return None
    
    def update_status(self, task_id: int, new_status: str) -> None:
        """Update the status of a task."""
        task = self._find_task(task_id)
        if not task:
            print(f"Task with ID {task_id} not found.")
            return
        
        valid_statuses = ['pending', 'in_progress', 'completed', 'cancelled']
        if new_status.lower() not in valid_statuses:
            print(f"Invalid status. Valid statuses: {', '.join(valid_statuses)}")
            return
        
        task['status'] = new_status.lower()
        if new_status.lower() == 'completed':
            task['completed_at'] = datetime.now().isoformat()
        
        if self._save_tasks():
            print(f"✓ Task {task_id} status updated to '{new_status}'")
        else:
            print("✗ Failed to update task")
    
    def delete_task(self, task_id: int) -> None:
        """Delete a task by ID."""
        task = self._find_task(task_id)
        if not task:
            print(f"Task with ID {task_id} not found.")
            return
        
        self.tasks.remove(task)
        if self._save_tasks():
            print(f"✓ Task {task_id} deleted successfully")
        else:
            print("✗ Failed to delete task")


def print_help():
    """Print usage instructions."""
    help_text = """
Task Manager - Command Line Interface

USAGE:
    python task_manager.py <command> [arguments]

COMMANDS:
    add <title> [description] [priority]
        Add a new task
        Priority can be: low, medium, high (default: medium)
        Example: python task_manager.py add "Buy groceries" "Milk, eggs, bread" high
    
    list [status]
        List all tasks or filter by status (pending, in_progress, completed, cancelled)
        Example: python task_manager.py list
        Example: python task_manager.py list completed
    
    search <query>
        Search tasks by title or description
        Example: python task_manager.py search "groceries"
    
    view <task_id>
        View detailed information about a specific task
        Example: python task_manager.py view 1
    
    update <task_id> <status>
        Update the status of a task
        Status can be: pending, in_progress, completed, cancelled
        Example: python task_manager.py update 1 completed
    
    delete <task_id>
        Delete a task
        Example: python task_manager.py delete 1
    
    help
        Show this help message

EXAMPLES:
    # Add a new task
    python task_manager.py add "Complete assignment" "CSC299 Task 1" high
    
    # List all tasks
    python task_manager.py list
    
    # List only pending tasks
    python task_manager.py list pending
    
    # Search for tasks containing "assignment"
    python task_manager.py search assignment
    
    # View task details
    python task_manager.py view 1
    
    # Mark task as completed
    python task_manager.py update 1 completed
    
    # Delete a task
    python task_manager.py delete 1
"""
    print(help_text)


def main():
    """Main entry point for the CLI application."""
    if len(sys.argv) < 2:
        print("Error: No command provided.")
        print_help()
        sys.exit(1)
    
    command = sys.argv[1].lower()
    manager = TaskManager()
    
    if command == "add":
        if len(sys.argv) < 3:
            print("Error: Task title is required.")
            print("Usage: python task_manager.py add <title> [description] [priority]")
            sys.exit(1)
        
        title = sys.argv[2]
        description = sys.argv[3] if len(sys.argv) > 3 else ""
        priority = sys.argv[4] if len(sys.argv) > 4 else "medium"
        manager.add_task(title, description, priority)
    
    elif command == "list":
        status_filter = sys.argv[2] if len(sys.argv) > 2 else None
        manager.list_tasks(status_filter)
    
    elif command == "search":
        if len(sys.argv) < 3:
            print("Error: Search query is required.")
            print("Usage: python task_manager.py search <query>")
            sys.exit(1)
        
        query = sys.argv[2]
        manager.search_tasks(query)
    
    elif command == "view":
        if len(sys.argv) < 3:
            print("Error: Task ID is required.")
            print("Usage: python task_manager.py view <task_id>")
            sys.exit(1)
        
        try:
            task_id = int(sys.argv[2])
            manager.view_task(task_id)
        except ValueError:
            print("Error: Task ID must be a number.")
            sys.exit(1)
    
    elif command == "update":
        if len(sys.argv) < 4:
            print("Error: Task ID and new status are required.")
            print("Usage: python task_manager.py update <task_id> <status>")
            sys.exit(1)
        
        try:
            task_id = int(sys.argv[2])
            new_status = sys.argv[3]
            manager.update_status(task_id, new_status)
        except ValueError:
            print("Error: Task ID must be a number.")
            sys.exit(1)
    
    elif command == "delete":
        if len(sys.argv) < 3:
            print("Error: Task ID is required.")
            print("Usage: python task_manager.py delete <task_id>")
            sys.exit(1)
        
        try:
            task_id = int(sys.argv[2])
            manager.delete_task(task_id)
        except ValueError:
            print("Error: Task ID must be a number.")
            sys.exit(1)
    
    elif command == "help":
        print_help()
    
    else:
        print(f"Error: Unknown command '{command}'")
        print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()

