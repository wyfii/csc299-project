"""
Task management core logic for TaskMaster.
Handles CRUD operations, persistence, and task queries.
"""

from __future__ import annotations

import json
import os
import csv
from typing import List, Dict, Optional

from .models import Task, VALID_STATUSES, VALID_PRIORITIES, PRIORITY_ORDER
from .ai import AITaskSummarizer
from .display import success, error, warning, ai_message


class TaskManager:
    """Manages tasks with persistence, AI features, and comprehensive operations."""
    
    def __init__(self, data_file: str = "tasks.json"):
        """Initialize the task manager with a data file."""
        self.data_file = data_file
        self.tasks: List[Task] = self._load_tasks()
        self.ai_summarizer = AITaskSummarizer()
    
    def _load_tasks(self) -> List[Task]:
        """Load tasks from the JSON file."""
        if not os.path.exists(self.data_file):
            return []
        
        try:
            with open(self.data_file, 'r') as f:
                data = json.load(f)
                return [Task(**task_dict) for task_dict in data]
        except (json.JSONDecodeError, IOError):
            return []
        except TypeError:
            return []
    
    def _save_tasks(self) -> bool:
        """Save tasks to the JSON file."""
        try:
            with open(self.data_file, 'w') as f:
                json.dump([task.to_dict() for task in self.tasks], f, indent=2)
            return True
        except IOError:
            return False
    
    def _get_next_id(self) -> int:
        """Get the next available task ID."""
        if not self.tasks:
            return 1
        return max(task.id for task in self.tasks) + 1
    
    def add_task(
        self,
        title: str,
        description: str = "",
        priority: str = "medium",
        due_date: Optional[str] = None,
        tags: Optional[List[str]] = None,
        use_ai_summary: bool = False
    ) -> Optional[Task]:
        """Add a new task."""
        # Validate priority
        if priority.lower() not in VALID_PRIORITIES:
            print(warning(f"Invalid priority: {priority}. Using 'medium'."))
            priority = "medium"
        
        # Optionally use AI to generate concise title from long description
        if use_ai_summary and description and len(description) > 50:
            if self.ai_summarizer.is_available():
                summary = self.ai_summarizer.summarize(description)
                if summary:
                    print(ai_message(f"AI suggested title: {summary}"))
                    response = input("Use AI suggestion? (y/n): ").lower()
                    if response == 'y':
                        title = summary
            else:
                print(warning("AI features not available (missing API key or openai package)"))
        
        task = Task(
            id=self._get_next_id(),
            title=title,
            description=description,
            priority=priority.lower(),
            due_date=due_date,
            tags=tags if tags else []
        )
        
        self.tasks.append(task)
        if self._save_tasks():
            print(success(f"Task added successfully (ID: {task.id})"))
            return task
        else:
            print(error("Failed to save task"))
            return None
    
    def get_task(self, task_id: int) -> Optional[Task]:
        """Get a task by ID."""
        for task in self.tasks:
            if task.id == task_id:
                return task
        return None
    
    def list_tasks(
        self,
        status_filter: Optional[str] = None,
        sort_by: str = "id",
        tag_filter: Optional[str] = None
    ) -> List[Task]:
        """List tasks with optional filtering and sorting."""
        filtered = self.tasks
        
        # Filter by status
        if status_filter:
            filtered = [t for t in filtered if t.status == status_filter.lower()]
        
        # Filter by tag
        if tag_filter:
            filtered = [t for t in filtered if tag_filter in t.tags]
        
        # Sort tasks
        if sort_by == "priority":
            filtered = sorted(filtered, key=lambda x: PRIORITY_ORDER.get(x.priority, 3))
        elif sort_by == "due_date":
            filtered = sorted(filtered, key=lambda x: (x.due_date or '9999-12-31'))
        elif sort_by == "created":
            filtered = sorted(filtered, key=lambda x: x.created_at)
        else:  # sort by id (default)
            filtered = sorted(filtered, key=lambda x: x.id)
        
        return filtered
    
    def update_status(self, task_id: int, new_status: str) -> bool:
        """Update the status of a task."""
        if new_status.lower() not in VALID_STATUSES:
            print(warning(f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}"))
            return False
        
        task = self.get_task(task_id)
        if not task:
            print(error(f"Task {task_id} not found."))
            return False
        
        old_status = task.status
        task.status = new_status.lower()
        
        # Set completion timestamp
        if new_status.lower() == "completed" and not task.completed_at:
            from datetime import datetime
            task.completed_at = datetime.now().isoformat()
        elif new_status.lower() != "completed":
            task.completed_at = None
        
        if self._save_tasks():
            print(success(f"Task {task_id} status updated: {old_status} → {new_status}"))
            return True
        return False
    
    def update_task(
        self,
        task_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None,
        priority: Optional[str] = None,
        due_date: Optional[str] = None,
        tags: Optional[List[str]] = None
    ) -> bool:
        """Update task fields."""
        task = self.get_task(task_id)
        if not task:
            print(error(f"Task {task_id} not found."))
            return False
        
        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        if priority is not None:
            if priority.lower() in VALID_PRIORITIES:
                task.priority = priority.lower()
            else:
                print(warning(f"Invalid priority: {priority}"))
        if due_date is not None:
            task.due_date = due_date
        if tags is not None:
            task.tags = tags
        
        if self._save_tasks():
            print(success(f"Task {task_id} updated successfully"))
            return True
        return False
    
    def delete_task(self, task_id: int) -> bool:
        """Delete a task."""
        task = self.get_task(task_id)
        if not task:
            print(error(f"Task {task_id} not found."))
            return False
        
        self.tasks.remove(task)
        if self._save_tasks():
            print(success(f"Task {task_id} deleted successfully"))
            return True
        return False
    
    def search_tasks(self, query: str) -> List[Task]:
        """Search tasks by title or description."""
        query_lower = query.lower()
        return [
            task for task in self.tasks
            if query_lower in task.title.lower() or query_lower in task.description.lower()
        ]
    
    def get_statistics(self) -> Dict:
        """Get comprehensive task statistics."""
        total = len(self.tasks)
        if total == 0:
            return {"total": 0}
        
        stats = {
            "total": total,
            "by_status": {},
            "by_priority": {},
            "overdue": 0,
            "tags": set()
        }
        
        for task in self.tasks:
            # Count by status
            stats["by_status"][task.status] = stats["by_status"].get(task.status, 0) + 1
            
            # Count by priority
            stats["by_priority"][task.priority] = stats["by_priority"].get(task.priority, 0) + 1
            
            # Count overdue
            if task.is_overdue():
                stats["overdue"] += 1
            
            # Collect tags
            stats["tags"].update(task.tags)
        
        return stats
    
    def export_to_csv(self, filename: str = "tasks_export.csv") -> bool:
        """Export all tasks to CSV file."""
        try:
            with open(filename, 'w', newline='') as csvfile:
                fieldnames = ['id', 'title', 'description', 'priority', 'status', 
                            'created_at', 'completed_at', 'due_date', 'tags']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                
                writer.writeheader()
                for task in self.tasks:
                    row = task.to_dict()
                    row['tags'] = ','.join(row['tags'])  # Convert list to string
                    writer.writerow(row)
            
            print(success(f"Exported {len(self.tasks)} tasks to {filename}"))
            return True
        except IOError as e:
            print(error(f"Error exporting to CSV: {e}"))
            return False
    
    def clear_completed(self) -> int:
        """Remove all completed tasks."""
        completed = [t for t in self.tasks if t.status == "completed"]
        count = len(completed)
        
        self.tasks = [t for t in self.tasks if t.status != "completed"]
        
        if self._save_tasks():
            print(success(f"Removed {count} completed task(s)"))
            return count
        return 0

