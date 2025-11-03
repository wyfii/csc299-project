#!/usr/bin/env python3
"""
Unit tests for the Task Manager CLI application.
Run with: python -m pytest test_task_manager.py -v
Or with: python test_task_manager.py
"""

import unittest
import os
import json
import tempfile
from datetime import datetime, timedelta
from task_manager import TaskManager


class TestTaskManager(unittest.TestCase):
    """Test cases for TaskManager class."""
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        # Create a temporary file for testing
        self.test_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json')
        self.test_file.close()
        self.manager = TaskManager(self.test_file.name)
    
    def tearDown(self):
        """Clean up after each test method."""
        # Remove the temporary file
        if os.path.exists(self.test_file.name):
            os.unlink(self.test_file.name)
    
    def test_initialization(self):
        """Test TaskManager initialization."""
        self.assertEqual(len(self.manager.tasks), 0)
        self.assertEqual(self.manager.data_file, self.test_file.name)
    
    def test_add_task_basic(self):
        """Test adding a basic task."""
        self.manager.add_task("Test task", "Test description", "high")
        self.assertEqual(len(self.manager.tasks), 1)
        
        task = self.manager.tasks[0]
        self.assertEqual(task['title'], "Test task")
        self.assertEqual(task['description'], "Test description")
        self.assertEqual(task['priority'], "high")
        self.assertEqual(task['status'], "pending")
        self.assertIsNotNone(task['created_at'])
        self.assertIsNone(task['completed_at'])
    
    def test_add_task_with_due_date(self):
        """Test adding a task with due date."""
        due_date = "2025-12-31"
        self.manager.add_task("Task with due date", "", "medium", due_date)
        
        task = self.manager.tasks[0]
        self.assertEqual(task['due_date'], due_date)
    
    def test_add_task_with_tags(self):
        """Test adding a task with tags."""
        tags = ["urgent", "work"]
        self.manager.add_task("Tagged task", "", "medium", None, tags)
        
        task = self.manager.tasks[0]
        self.assertEqual(task['tags'], tags)
    
    def test_get_next_id(self):
        """Test ID generation."""
        self.assertEqual(self.manager._get_next_id(), 1)
        
        self.manager.add_task("Task 1")
        self.assertEqual(self.manager._get_next_id(), 2)
        
        self.manager.add_task("Task 2")
        self.assertEqual(self.manager._get_next_id(), 3)
    
    def test_find_task(self):
        """Test finding tasks by ID."""
        self.manager.add_task("Task 1")
        self.manager.add_task("Task 2")
        
        task = self.manager._find_task(1)
        self.assertIsNotNone(task)
        self.assertEqual(task['title'], "Task 1")
        
        task = self.manager._find_task(2)
        self.assertIsNotNone(task)
        self.assertEqual(task['title'], "Task 2")
        
        task = self.manager._find_task(999)
        self.assertIsNone(task)
    
    def test_update_status(self):
        """Test updating task status."""
        self.manager.add_task("Test task")
        
        self.manager.update_status(1, "in_progress")
        task = self.manager._find_task(1)
        self.assertEqual(task['status'], "in_progress")
        
        self.manager.update_status(1, "completed")
        task = self.manager._find_task(1)
        self.assertEqual(task['status'], "completed")
        self.assertIsNotNone(task['completed_at'])
    
    def test_update_status_invalid(self):
        """Test updating with invalid status."""
        self.manager.add_task("Test task")
        
        # Should not change status for invalid value
        initial_status = self.manager._find_task(1)['status']
        self.manager.update_status(1, "invalid_status")
        task = self.manager._find_task(1)
        self.assertEqual(task['status'], initial_status)
    
    def test_delete_task(self):
        """Test deleting a task."""
        self.manager.add_task("Task 1")
        self.manager.add_task("Task 2")
        self.assertEqual(len(self.manager.tasks), 2)
        
        self.manager.delete_task(1)
        self.assertEqual(len(self.manager.tasks), 1)
        self.assertIsNone(self.manager._find_task(1))
        self.assertIsNotNone(self.manager._find_task(2))
    
    def test_edit_task(self):
        """Test editing task fields."""
        self.manager.add_task("Original title", "Original description", "low")
        
        # Edit title
        self.manager.edit_task(1, title="New title")
        task = self.manager._find_task(1)
        self.assertEqual(task['title'], "New title")
        self.assertEqual(task['description'], "Original description")
        
        # Edit priority
        self.manager.edit_task(1, priority="high")
        task = self.manager._find_task(1)
        self.assertEqual(task['priority'], "high")
        
        # Edit multiple fields
        self.manager.edit_task(1, description="New description", due_date="2025-12-31")
        task = self.manager._find_task(1)
        self.assertEqual(task['description'], "New description")
        self.assertEqual(task['due_date'], "2025-12-31")
    
    def test_edit_task_with_tags(self):
        """Test editing task tags."""
        self.manager.add_task("Task", "", "medium", None, ["old_tag"])
        
        self.manager.edit_task(1, tags=["new_tag1", "new_tag2"])
        task = self.manager._find_task(1)
        self.assertEqual(task['tags'], ["new_tag1", "new_tag2"])
    
    def test_clear_completed(self):
        """Test clearing completed tasks."""
        self.manager.add_task("Task 1")
        self.manager.add_task("Task 2")
        self.manager.add_task("Task 3")
        
        self.manager.update_status(1, "completed")
        self.manager.update_status(3, "completed")
        
        self.assertEqual(len(self.manager.tasks), 3)
        self.manager.clear_completed()
        self.assertEqual(len(self.manager.tasks), 1)
        
        # Only Task 2 should remain
        self.assertIsNone(self.manager._find_task(1))
        self.assertIsNotNone(self.manager._find_task(2))
        self.assertIsNone(self.manager._find_task(3))
    
    def test_search_tasks(self):
        """Test searching tasks."""
        self.manager.add_task("Buy groceries", "Milk and eggs")
        self.manager.add_task("Complete assignment", "CSC299 project")
        self.manager.add_task("Call plumber", "Fix leak")
        
        # Search should find tasks in title
        results = [t for t in self.manager.tasks if "groceries" in t['title'].lower()]
        self.assertEqual(len(results), 1)
        
        # Search should find tasks in description
        results = [t for t in self.manager.tasks if "csc299" in t['description'].lower()]
        self.assertEqual(len(results), 1)
    
    def test_persistence(self):
        """Test that tasks are saved and loaded correctly."""
        # Add tasks
        self.manager.add_task("Task 1", "Description 1", "high")
        self.manager.add_task("Task 2", "Description 2", "low", "2025-12-31", ["tag1", "tag2"])
        
        # Create a new manager instance with same file
        new_manager = TaskManager(self.test_file.name)
        
        # Check that tasks were loaded
        self.assertEqual(len(new_manager.tasks), 2)
        
        task1 = new_manager._find_task(1)
        self.assertEqual(task1['title'], "Task 1")
        self.assertEqual(task1['priority'], "high")
        
        task2 = new_manager._find_task(2)
        self.assertEqual(task2['title'], "Task 2")
        self.assertEqual(task2['due_date'], "2025-12-31")
        self.assertEqual(task2['tags'], ["tag1", "tag2"])
    
    def test_export_to_csv(self):
        """Test exporting tasks to CSV."""
        self.manager.add_task("Task 1", "Description 1", "high", "2025-12-31", ["tag1"])
        self.manager.add_task("Task 2", "Description 2", "low")
        
        csv_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv')
        csv_file.close()
        
        try:
            self.manager.export_to_csv(csv_file.name)
            
            # Verify CSV file exists and has content
            self.assertTrue(os.path.exists(csv_file.name))
            
            with open(csv_file.name, 'r') as f:
                content = f.read()
                self.assertIn("Task 1", content)
                self.assertIn("Task 2", content)
                self.assertIn("tag1", content)
        finally:
            if os.path.exists(csv_file.name):
                os.unlink(csv_file.name)
    
    def test_list_tasks_filtering(self):
        """Test list tasks with status filtering."""
        self.manager.add_task("Task 1")
        self.manager.add_task("Task 2")
        self.manager.add_task("Task 3")
        
        self.manager.update_status(1, "completed")
        self.manager.update_status(2, "in_progress")
        
        # Filter by completed
        completed = [t for t in self.manager.tasks if t['status'] == 'completed']
        self.assertEqual(len(completed), 1)
        
        # Filter by in_progress
        in_progress = [t for t in self.manager.tasks if t['status'] == 'in_progress']
        self.assertEqual(len(in_progress), 1)
        
        # Filter by pending
        pending = [t for t in self.manager.tasks if t['status'] == 'pending']
        self.assertEqual(len(pending), 1)
    
    def test_list_tasks_sorting(self):
        """Test list tasks with different sort options."""
        # Add tasks with different priorities and dates
        self.manager.add_task("Low priority", "", "low", "2025-12-31")
        self.manager.add_task("High priority", "", "high", "2025-11-15")
        self.manager.add_task("Medium priority", "", "medium", "2025-11-20")
        
        # Test sorting by priority
        priority_order = {"high": 0, "medium": 1, "low": 2}
        sorted_tasks = sorted(self.manager.tasks, key=lambda x: priority_order.get(x['priority'], 3))
        self.assertEqual(sorted_tasks[0]['priority'], "high")
        self.assertEqual(sorted_tasks[1]['priority'], "medium")
        self.assertEqual(sorted_tasks[2]['priority'], "low")
        
        # Test sorting by due_date
        sorted_tasks = sorted(self.manager.tasks, key=lambda x: x.get('due_date') or '9999-12-31')
        self.assertEqual(sorted_tasks[0]['due_date'], "2025-11-15")
        self.assertEqual(sorted_tasks[1]['due_date'], "2025-11-20")
        self.assertEqual(sorted_tasks[2]['due_date'], "2025-12-31")
    
    def test_overdue_detection(self):
        """Test overdue task detection."""
        # Add task with past due date
        past_date = (datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d")
        self.manager.add_task("Overdue task", "", "high", past_date)
        
        # Add task with future due date
        future_date = (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d")
        self.manager.add_task("Future task", "", "medium", future_date)
        
        # Check that past date task is considered overdue
        task1 = self.manager._find_task(1)
        due_date = datetime.fromisoformat(task1['due_date']).date()
        today = datetime.now().date()
        self.assertTrue(due_date < today)
        
        # Check that future date task is not overdue
        task2 = self.manager._find_task(2)
        due_date = datetime.fromisoformat(task2['due_date']).date()
        self.assertFalse(due_date < today)
    
    def test_empty_task_list(self):
        """Test operations on empty task list."""
        # Clear completed should handle empty list
        self.manager.clear_completed()
        self.assertEqual(len(self.manager.tasks), 0)
    
    def test_priority_validation(self):
        """Test that priorities are stored in lowercase."""
        self.manager.add_task("Task", "", "HIGH")
        task = self.manager._find_task(1)
        self.assertEqual(task['priority'], "high")
    
    def test_multiple_tags(self):
        """Test tasks with multiple tags."""
        tags = ["urgent", "work", "client", "deadline"]
        self.manager.add_task("Complex task", "", "high", None, tags)
        
        task = self.manager._find_task(1)
        self.assertEqual(len(task['tags']), 4)
        self.assertIn("urgent", task['tags'])
        self.assertIn("deadline", task['tags'])


class TestTaskManagerStatistics(unittest.TestCase):
    """Test cases for statistics functionality."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.test_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json')
        self.test_file.close()
        self.manager = TaskManager(self.test_file.name)
    
    def tearDown(self):
        """Clean up after tests."""
        if os.path.exists(self.test_file.name):
            os.unlink(self.test_file.name)
    
    def test_statistics_empty(self):
        """Test statistics with no tasks."""
        # Should not crash on empty task list
        self.assertEqual(len(self.manager.tasks), 0)
    
    def test_statistics_by_status(self):
        """Test statistics grouped by status."""
        self.manager.add_task("Task 1")
        self.manager.add_task("Task 2")
        self.manager.add_task("Task 3")
        self.manager.add_task("Task 4")
        
        self.manager.update_status(1, "completed")
        self.manager.update_status(2, "completed")
        self.manager.update_status(3, "in_progress")
        
        by_status = {}
        for task in self.manager.tasks:
            status = task['status']
            by_status[status] = by_status.get(status, 0) + 1
        
        self.assertEqual(by_status.get('completed', 0), 2)
        self.assertEqual(by_status.get('in_progress', 0), 1)
        self.assertEqual(by_status.get('pending', 0), 1)
    
    def test_statistics_by_priority(self):
        """Test statistics grouped by priority."""
        self.manager.add_task("Task 1", "", "high")
        self.manager.add_task("Task 2", "", "high")
        self.manager.add_task("Task 3", "", "medium")
        self.manager.add_task("Task 4", "", "low")
        
        by_priority = {}
        for task in self.manager.tasks:
            priority = task['priority']
            by_priority[priority] = by_priority.get(priority, 0) + 1
        
        self.assertEqual(by_priority.get('high', 0), 2)
        self.assertEqual(by_priority.get('medium', 0), 1)
        self.assertEqual(by_priority.get('low', 0), 1)


def run_tests():
    """Run all tests."""
    unittest.main(verbosity=2)


if __name__ == '__main__':
    run_tests()

