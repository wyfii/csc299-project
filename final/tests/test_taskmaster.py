"""
Comprehensive test suite for TaskMaster
CSC299 Final Project
"""

import pytest
import os
import json
from datetime import datetime, timedelta

from taskmaster.models import Task, VALID_STATUSES, VALID_PRIORITIES
from taskmaster.manager import TaskManager
from taskmaster.ai import AITaskSummarizer


class TestTask:
    """Test the Task dataclass."""
    
    def test_task_creation(self):
        """Test basic task creation."""
        task = Task(id=1, title="Test Task")
        assert task.id == 1
        assert task.title == "Test Task"
        assert task.priority == "medium"
        assert task.status == "pending"
        assert task.tags == []
    
    def test_task_with_all_fields(self):
        """Test task creation with all fields."""
        task = Task(
            id=1,
            title="Complete Project",
            description="CSC299 Final",
            priority="high",
            status="in_progress",
            due_date="2025-11-24",
            tags=["school", "urgent"]
        )
        assert task.title == "Complete Project"
        assert task.description == "CSC299 Final"
        assert task.priority == "high"
        assert task.status == "in_progress"
        assert task.due_date == "2025-11-24"
        assert task.tags == ["school", "urgent"]
    
    def test_task_to_dict(self):
        """Test converting task to dictionary."""
        task = Task(id=1, title="Test", priority="high", tags=["test"])
        task_dict = task.to_dict()
        assert isinstance(task_dict, dict)
        assert task_dict["id"] == 1
        assert task_dict["title"] == "Test"
        assert task_dict["priority"] == "high"
        assert task_dict["tags"] == ["test"]
    
    def test_task_is_overdue_past_date(self):
        """Test overdue detection for past dates."""
        past_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        task = Task(id=1, title="Test", due_date=past_date, status="pending")
        assert task.is_overdue() is True
    
    def test_task_is_overdue_future_date(self):
        """Test overdue detection for future dates."""
        future_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        task = Task(id=1, title="Test", due_date=future_date, status="pending")
        assert task.is_overdue() is False
    
    def test_task_is_overdue_completed(self):
        """Test that completed tasks are never overdue."""
        past_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        task = Task(id=1, title="Test", due_date=past_date, status="completed")
        assert task.is_overdue() is False
    
    def test_task_is_overdue_no_due_date(self):
        """Test that tasks without due dates are not overdue."""
        task = Task(id=1, title="Test", status="pending")
        assert task.is_overdue() is False


class TestTaskManager:
    """Test the TaskManager class."""
    
    @pytest.fixture
    def temp_file(self, tmp_path):
        """Create a temporary tasks file."""
        return str(tmp_path / "test_tasks.json")
    
    @pytest.fixture
    def manager(self, temp_file):
        """Create a TaskManager instance with temporary file."""
        return TaskManager(temp_file)
    
    def test_manager_initialization(self, manager):
        """Test TaskManager initialization."""
        assert isinstance(manager.tasks, list)
        assert len(manager.tasks) == 0
    
    def test_add_task_basic(self, manager, capsys):
        """Test adding a basic task."""
        task = manager.add_task("Test Task")
        assert task is not None
        assert task.title == "Test Task"
        assert task.id == 1
        assert len(manager.tasks) == 1
    
    def test_add_task_with_all_fields(self, manager):
        """Test adding a task with all fields."""
        task = manager.add_task(
            title="Complete Project",
            description="Final project",
            priority="high",
            due_date="2025-12-01",
            tags=["work", "urgent"]
        )
        assert task.title == "Complete Project"
        assert task.description == "Final project"
        assert task.priority == "high"
        assert task.due_date == "2025-12-01"
        assert task.tags == ["work", "urgent"]
    
    def test_add_task_invalid_priority(self, manager):
        """Test adding task with invalid priority."""
        task = manager.add_task("Test", priority="invalid")
        assert task.priority == "medium"  # Should default to medium
    
    def test_get_next_id(self, manager):
        """Test next ID generation."""
        manager.add_task("Task 1")
        manager.add_task("Task 2")
        assert manager._get_next_id() == 3
    
    def test_get_task_existing(self, manager):
        """Test getting an existing task."""
        added_task = manager.add_task("Test Task")
        retrieved_task = manager.get_task(added_task.id)
        assert retrieved_task is not None
        assert retrieved_task.title == "Test Task"
    
    def test_get_task_nonexistent(self, manager):
        """Test getting a non-existent task."""
        task = manager.get_task(999)
        assert task is None
    
    def test_update_status_valid(self, manager):
        """Test updating task status."""
        task = manager.add_task("Test Task")
        success = manager.update_status(task.id, "in_progress")
        assert success is True
        assert task.status == "in_progress"
    
    def test_update_status_to_completed(self, manager):
        """Test updating task to completed sets timestamp."""
        task = manager.add_task("Test Task")
        manager.update_status(task.id, "completed")
        assert task.status == "completed"
        assert task.completed_at is not None
    
    def test_update_status_invalid(self, manager):
        """Test updating task with invalid status."""
        task = manager.add_task("Test Task")
        success = manager.update_status(task.id, "invalid_status")
        assert success is False
        assert task.status == "pending"  # Should remain unchanged
    
    def test_delete_task_existing(self, manager):
        """Test deleting an existing task."""
        task = manager.add_task("Test Task")
        success = manager.delete_task(task.id)
        assert success is True
        assert len(manager.tasks) == 0
    
    def test_delete_task_nonexistent(self, manager):
        """Test deleting a non-existent task."""
        success = manager.delete_task(999)
        assert success is False
    
    def test_list_tasks_no_filter(self, manager):
        """Test listing all tasks."""
        manager.add_task("Task 1")
        manager.add_task("Task 2")
        tasks = manager.list_tasks()
        assert len(tasks) == 2
    
    def test_list_tasks_status_filter(self, manager):
        """Test listing tasks with status filter."""
        task1 = manager.add_task("Task 1")
        task2 = manager.add_task("Task 2")
        manager.update_status(task1.id, "completed")
        
        completed_tasks = manager.list_tasks(status_filter="completed")
        assert len(completed_tasks) == 1
        assert completed_tasks[0].id == task1.id
    
    def test_list_tasks_sort_by_priority(self, manager):
        """Test listing tasks sorted by priority."""
        manager.add_task("Low Task", priority="low")
        manager.add_task("High Task", priority="high")
        manager.add_task("Medium Task", priority="medium")
        
        tasks = manager.list_tasks(sort_by="priority")
        assert tasks[0].priority == "high"
        assert tasks[1].priority == "medium"
        assert tasks[2].priority == "low"
    
    def test_list_tasks_tag_filter(self, manager):
        """Test listing tasks with tag filter."""
        manager.add_task("Task 1", tags=["work"])
        manager.add_task("Task 2", tags=["personal"])
        manager.add_task("Task 3", tags=["work", "urgent"])
        
        work_tasks = manager.list_tasks(tag_filter="work")
        assert len(work_tasks) == 2
    
    def test_search_tasks_found(self, manager):
        """Test searching for tasks."""
        manager.add_task("Buy groceries", "Milk and eggs")
        manager.add_task("Clean house", "Living room and kitchen")
        
        results = manager.search_tasks("groceries")
        assert len(results) == 1
        assert results[0].title == "Buy groceries"
    
    def test_search_tasks_not_found(self, manager):
        """Test searching for non-existent tasks."""
        manager.add_task("Task 1")
        results = manager.search_tasks("nonexistent")
        assert len(results) == 0
    
    def test_search_tasks_case_insensitive(self, manager):
        """Test case-insensitive search."""
        manager.add_task("Buy GROCERIES")
        results = manager.search_tasks("groceries")
        assert len(results) == 1
    
    def test_get_statistics_empty(self, manager):
        """Test statistics with no tasks."""
        stats = manager.get_statistics()
        assert stats["total"] == 0
    
    def test_get_statistics_with_tasks(self, manager):
        """Test statistics with various tasks."""
        manager.add_task("Task 1", priority="high", tags=["work"])
        task2 = manager.add_task("Task 2", priority="low", tags=["personal"])
        manager.update_status(task2.id, "completed")
        
        stats = manager.get_statistics()
        assert stats["total"] == 2
        assert stats["by_status"]["pending"] == 1
        assert stats["by_status"]["completed"] == 1
        assert stats["by_priority"]["high"] == 1
        assert stats["by_priority"]["low"] == 1
        assert "work" in stats["tags"]
        assert "personal" in stats["tags"]
    
    def test_get_statistics_overdue(self, manager):
        """Test statistics with overdue tasks."""
        past_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        manager.add_task("Overdue Task", due_date=past_date)
        
        stats = manager.get_statistics()
        assert stats["overdue"] == 1
    
    def test_export_to_csv(self, manager, tmp_path):
        """Test exporting tasks to CSV."""
        manager.add_task("Task 1", "Description 1", "high")
        manager.add_task("Task 2", "Description 2", "low")
        
        csv_file = str(tmp_path / "export.csv")
        success = manager.export_to_csv(csv_file)
        assert success is True
        assert os.path.exists(csv_file)
        
        # Verify CSV contents
        with open(csv_file, 'r') as f:
            lines = f.readlines()
            assert len(lines) == 3  # Header + 2 tasks
            assert "id,title,description" in lines[0]
    
    def test_clear_completed(self, manager):
        """Test clearing completed tasks."""
        task1 = manager.add_task("Task 1")
        task2 = manager.add_task("Task 2")
        task3 = manager.add_task("Task 3")
        
        manager.update_status(task1.id, "completed")
        manager.update_status(task3.id, "completed")
        
        count = manager.clear_completed()
        assert count == 2
        assert len(manager.tasks) == 1
        assert manager.tasks[0].id == task2.id
    
    def test_persistence(self, temp_file):
        """Test that tasks persist across manager instances."""
        # Create first manager and add tasks
        manager1 = TaskManager(temp_file)
        manager1.add_task("Persistent Task", priority="high")
        
        # Create new manager with same file
        manager2 = TaskManager(temp_file)
        assert len(manager2.tasks) == 1
        assert manager2.tasks[0].title == "Persistent Task"
        assert manager2.tasks[0].priority == "high"
    
    def test_load_tasks_corrupted_file(self, temp_file):
        """Test loading from corrupted JSON file."""
        # Write invalid JSON
        with open(temp_file, 'w') as f:
            f.write("invalid json{")
        
        manager = TaskManager(temp_file)
        assert len(manager.tasks) == 0  # Should handle gracefully
    
    def test_update_task_fields(self, manager):
        """Test updating individual task fields."""
        task = manager.add_task("Original Title")
        
        success = manager.update_task(
            task.id,
            title="New Title",
            description="New Description",
            priority="high"
        )
        
        assert success is True
        assert task.title == "New Title"
        assert task.description == "New Description"
        assert task.priority == "high"


class TestAITaskSummarizer:
    """Test the AI summarizer (without actual API calls)."""
    
    def test_summarizer_without_api_key(self):
        """Test summarizer initialization without API key."""
        summarizer = AITaskSummarizer(api_key=None)
        assert summarizer.is_available() is False
    
    def test_summarizer_with_invalid_api_key(self):
        """Test summarizer with invalid API key."""
        summarizer = AITaskSummarizer(api_key="invalid_key")
        # Should initialize but API calls will fail
        assert summarizer.api_key == "invalid_key"
    
    def test_summarize_without_client(self):
        """Test summarization when client is unavailable."""
        summarizer = AITaskSummarizer(api_key=None)
        result = summarizer.summarize("Long task description")
        assert result is None


def test_module_version():
    """Test that module version is defined."""
    from taskmaster import __version__
    assert __version__ == "1.0.0"


def test_module_exports():
    """Test that key classes are exported."""
    from taskmaster import Task, TaskManager, AITaskSummarizer, TaskMasterChat
    assert Task is not None
    assert TaskManager is not None
    assert AITaskSummarizer is not None
    assert TaskMasterChat is not None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
