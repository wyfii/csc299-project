"""
TaskMaster - Professional AI-Enhanced Task Management System

A chat-style interactive task manager combining:
- Professional packaging and structure
- Rich features (due dates, tags, stats, CSV export)
- AI-powered task summarization
- Comprehensive testing
- Beautiful colored terminal UI

CSC299 Final Project
"""

__version__ = "1.0.0"

# Import main classes for external use
from .models import Task, VALID_STATUSES, VALID_PRIORITIES
from .manager import TaskManager
from .ai import AITaskSummarizer
from .chat import TaskMasterChat
from .display import (
    print_task_list,
    print_task_details,
    print_statistics,
    success,
    error,
    warning,
    info,
)

# Entry point
from .chat import main

__all__ = [
    '__version__',
    'Task',
    'TaskManager',
    'AITaskSummarizer',
    'TaskMasterChat',
    'main',
    'VALID_STATUSES',
    'VALID_PRIORITIES',
    'print_task_list',
    'print_task_details',
    'print_statistics',
    'success',
    'error',
    'warning',
    'info',
]
