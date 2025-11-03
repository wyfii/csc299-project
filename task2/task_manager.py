#!/usr/bin/env python3
"""
Command-line Task Manager
An enhanced CLI application to store, list, search, and manage tasks in a JSON file.
"""

import json
import os
import sys
import csv
from datetime import datetime, timedelta
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
    
    def add_task(self, title: str, description: str = "", priority: str = "medium", 
                 due_date: Optional[str] = None, tags: List[str] = None) -> None:
        """Add a new task."""
        if tags is None:
            tags = []
        
        task = {
            "id": self._get_next_id(),
            "title": title,
            "description": description,
            "priority": priority.lower(),
            "status": "pending",
            "created_at": datetime.now().isoformat(),
            "completed_at": None,
            "due_date": due_date,
            "tags": tags
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
    
    def list_tasks(self, status_filter: Optional[str] = None, sort_by: str = "id") -> None:
        """List all tasks, optionally filtered by status and sorted."""
        filtered_tasks = self.tasks
        
        if status_filter:
            filtered_tasks = [t for t in self.tasks if t['status'] == status_filter.lower()]
        
        if not filtered_tasks:
            print("No tasks found.")
            return
        
        # Sort tasks
        if sort_by == "priority":
            priority_order = {"high": 0, "medium": 1, "low": 2}
            filtered_tasks = sorted(filtered_tasks, key=lambda x: priority_order.get(x['priority'], 3))
        elif sort_by == "due_date":
            filtered_tasks = sorted(filtered_tasks, key=lambda x: (x.get('due_date') or '9999-12-31'))
        elif sort_by == "created":
            filtered_tasks = sorted(filtered_tasks, key=lambda x: x['created_at'])
        else:  # sort by id (default)
            filtered_tasks = sorted(filtered_tasks, key=lambda x: x['id'])
        
        print(f"\n{'ID':<5} {'Title':<25} {'Priority':<8} {'Status':<12} {'Due Date':<12} {'Tags':<15}")
        print("-" * 85)
        
        for task in filtered_tasks:
            # Check if overdue
            due_str = ""
            if task.get('due_date'):
                due_date = datetime.fromisoformat(task['due_date']).date()
                today = datetime.now().date()
                if due_date < today and task['status'] != 'completed':
                    due_str = f"{task['due_date']} ⚠"
                else:
                    due_str = task['due_date']
            else:
                due_str = "-"
            
            tags_str = ",".join(task.get('tags', [])[:2]) if task.get('tags') else "-"
            print(f"{task['id']:<5} {task['title'][:24]:<25} {task['priority']:<8} {task['status']:<12} {due_str:<12} {tags_str:<15}")
        
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
        
        if task.get('due_date'):
            due_date = datetime.fromisoformat(task['due_date']).date()
            today = datetime.now().date()
            overdue = " (OVERDUE!)" if due_date < today and task['status'] != 'completed' else ""
            print(f"Due Date: {task['due_date']}{overdue}")
        
        if task.get('tags'):
            print(f"Tags: {', '.join(task['tags'])}")
        
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
    
    def edit_task(self, task_id: int, title: Optional[str] = None, 
                  description: Optional[str] = None, priority: Optional[str] = None,
                  due_date: Optional[str] = None, tags: Optional[List[str]] = None) -> None:
        """Edit an existing task."""
        task = self._find_task(task_id)
        if not task:
            print(f"Task with ID {task_id} not found.")
            return
        
        if title is not None:
            task['title'] = title
        if description is not None:
            task['description'] = description
        if priority is not None:
            task['priority'] = priority.lower()
        if due_date is not None:
            task['due_date'] = due_date
        if tags is not None:
            task['tags'] = tags
        
        if self._save_tasks():
            print(f"✓ Task {task_id} updated successfully")
        else:
            print("✗ Failed to update task")
    
    def clear_completed(self) -> None:
        """Remove all completed tasks."""
        completed_count = len([t for t in self.tasks if t['status'] == 'completed'])
        if completed_count == 0:
            print("No completed tasks to clear.")
            return
        
        self.tasks = [t for t in self.tasks if t['status'] != 'completed']
        if self._save_tasks():
            print(f"✓ Cleared {completed_count} completed task(s)")
        else:
            print("✗ Failed to clear completed tasks")
    
    def show_statistics(self) -> None:
        """Display task statistics and summary."""
        if not self.tasks:
            print("No tasks to display statistics for.")
            return
        
        total = len(self.tasks)
        by_status = {}
        by_priority = {}
        overdue_count = 0
        today = datetime.now().date()
        
        for task in self.tasks:
            # Count by status
            status = task['status']
            by_status[status] = by_status.get(status, 0) + 1
            
            # Count by priority
            priority = task['priority']
            by_priority[priority] = by_priority.get(priority, 0) + 1
            
            # Count overdue
            if task.get('due_date') and task['status'] != 'completed':
                due_date = datetime.fromisoformat(task['due_date']).date()
                if due_date < today:
                    overdue_count += 1
        
        print("\n" + "=" * 60)
        print("TASK STATISTICS")
        print("=" * 60)
        print(f"\nTotal Tasks: {total}")
        
        print("\nBy Status:")
        for status in ['pending', 'in_progress', 'completed', 'cancelled']:
            count = by_status.get(status, 0)
            percentage = (count / total * 100) if total > 0 else 0
            print(f"  {status.replace('_', ' ').title()}: {count} ({percentage:.1f}%)")
        
        print("\nBy Priority:")
        for priority in ['high', 'medium', 'low']:
            count = by_priority.get(priority, 0)
            percentage = (count / total * 100) if total > 0 else 0
            print(f"  {priority.title()}: {count} ({percentage:.1f}%)")
        
        if overdue_count > 0:
            print(f"\n⚠ Overdue Tasks: {overdue_count}")
        
        # Show tags if any
        all_tags = set()
        for task in self.tasks:
            if task.get('tags'):
                all_tags.update(task['tags'])
        
        if all_tags:
            print(f"\nActive Tags: {', '.join(sorted(all_tags))}")
        
        print("=" * 60 + "\n")
    
    def export_to_csv(self, filename: str = "tasks_export.csv") -> None:
        """Export tasks to a CSV file."""
        if not self.tasks:
            print("No tasks to export.")
            return
        
        try:
            with open(filename, 'w', newline='') as csvfile:
                fieldnames = ['id', 'title', 'description', 'priority', 'status', 
                            'created_at', 'completed_at', 'due_date', 'tags']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                
                writer.writeheader()
                for task in self.tasks:
                    # Convert tags list to string for CSV
                    export_task = task.copy()
                    export_task['tags'] = ','.join(task.get('tags', []))
                    writer.writerow(export_task)
            
            print(f"✓ Exported {len(self.tasks)} task(s) to {filename}")
        except IOError as e:
            print(f"✗ Failed to export tasks: {e}")


def print_help():
    """Print usage instructions."""
    help_text = """
Task Manager - Command Line Interface

USAGE:
    python task_manager.py <command> [arguments]

COMMANDS:
    add <title> [description] [priority] [--due YYYY-MM-DD] [--tags tag1,tag2]
        Add a new task
        Priority can be: low, medium, high (default: medium)
        Example: python task_manager.py add "Buy groceries" "Milk, eggs, bread" high --due 2025-11-10 --tags shopping,urgent
    
    list [status] [--sort-by FIELD]
        List all tasks or filter by status (pending, in_progress, completed, cancelled)
        Sort options: id, priority, due_date, created (default: id)
        Example: python task_manager.py list
        Example: python task_manager.py list pending --sort-by priority
    
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
    
    edit <task_id> [--title TITLE] [--description DESC] [--priority PRIORITY] [--due DATE] [--tags tag1,tag2]
        Edit task fields
        Example: python task_manager.py edit 1 --title "New title" --priority high
    
    delete <task_id>
        Delete a task
        Example: python task_manager.py delete 1
    
    stats
        Display task statistics and summary
        Example: python task_manager.py stats
    
    export [filename]
        Export tasks to CSV file (default: tasks_export.csv)
        Example: python task_manager.py export my_tasks.csv
    
    clear-completed
        Remove all completed tasks
        Example: python task_manager.py clear-completed
    
    help
        Show this help message

EXAMPLES:
    # Add a new task with due date and tags
    python task_manager.py add "Complete assignment" "CSC299 Task 2" high --due 2025-11-15 --tags school,urgent
    
    # List all tasks sorted by priority
    python task_manager.py list --sort-by priority
    
    # List only pending tasks sorted by due date
    python task_manager.py list pending --sort-by due_date
    
    # Edit a task's title and priority
    python task_manager.py edit 1 --title "Updated title" --priority low
    
    # View task statistics
    python task_manager.py stats
    
    # Export tasks to CSV
    python task_manager.py export
    
    # Clear all completed tasks
    python task_manager.py clear-completed
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
            print("Usage: python task_manager.py add <title> [description] [priority] [--due DATE] [--tags tag1,tag2]")
            sys.exit(1)
        
        title = sys.argv[2]
        description = ""
        priority = "medium"
        due_date = None
        tags = []
        
        # Parse positional arguments
        if len(sys.argv) > 3 and not sys.argv[3].startswith('--'):
            description = sys.argv[3]
        if len(sys.argv) > 4 and not sys.argv[4].startswith('--'):
            priority = sys.argv[4]
        
        # Parse optional flags
        i = 3
        while i < len(sys.argv):
            if sys.argv[i] == '--due' and i + 1 < len(sys.argv):
                due_date = sys.argv[i + 1]
                i += 2
            elif sys.argv[i] == '--tags' and i + 1 < len(sys.argv):
                tags = [tag.strip() for tag in sys.argv[i + 1].split(',')]
                i += 2
            else:
                i += 1
        
        manager.add_task(title, description, priority, due_date, tags)
    
    elif command == "list":
        status_filter = None
        sort_by = "id"
        
        # Parse arguments
        i = 2
        while i < len(sys.argv):
            if sys.argv[i] == '--sort-by' and i + 1 < len(sys.argv):
                sort_by = sys.argv[i + 1]
                i += 2
            elif not sys.argv[i].startswith('--'):
                status_filter = sys.argv[i]
                i += 1
            else:
                i += 1
        
        manager.list_tasks(status_filter, sort_by)
    
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
    
    elif command == "edit":
        if len(sys.argv) < 3:
            print("Error: Task ID is required.")
            print("Usage: python task_manager.py edit <task_id> [--title TITLE] [--description DESC] [--priority PRIORITY] [--due DATE] [--tags tag1,tag2]")
            sys.exit(1)
        
        try:
            task_id = int(sys.argv[2])
            title = None
            description = None
            priority = None
            due_date = None
            tags = None
            
            # Parse optional flags
            i = 3
            while i < len(sys.argv):
                if sys.argv[i] == '--title' and i + 1 < len(sys.argv):
                    title = sys.argv[i + 1]
                    i += 2
                elif sys.argv[i] == '--description' and i + 1 < len(sys.argv):
                    description = sys.argv[i + 1]
                    i += 2
                elif sys.argv[i] == '--priority' and i + 1 < len(sys.argv):
                    priority = sys.argv[i + 1]
                    i += 2
                elif sys.argv[i] == '--due' and i + 1 < len(sys.argv):
                    due_date = sys.argv[i + 1]
                    i += 2
                elif sys.argv[i] == '--tags' and i + 1 < len(sys.argv):
                    tags = [tag.strip() for tag in sys.argv[i + 1].split(',')]
                    i += 2
                else:
                    i += 1
            
            manager.edit_task(task_id, title, description, priority, due_date, tags)
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
    
    elif command == "stats":
        manager.show_statistics()
    
    elif command == "export":
        filename = sys.argv[2] if len(sys.argv) > 2 else "tasks_export.csv"
        manager.export_to_csv(filename)
    
    elif command == "clear-completed":
        manager.clear_completed()
    
    elif command == "help":
        print_help()
    
    else:
        print(f"Error: Unknown command '{command}'")
        print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()

