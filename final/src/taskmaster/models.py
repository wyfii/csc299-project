"""
Data models for TaskMaster.
Defines the Task dataclass and related types.
"""

from __future__ import annotations

from dataclasses import dataclass, asdict
from datetime import datetime
from typing import List, Dict, Optional


@dataclass
class Task:
    """Represents a single task with all its properties."""
    
    id: int
    title: str
    description: str = ""
    priority: str = "medium"
    status: str = "pending"
    created_at: str = ""
    completed_at: Optional[str] = None
    due_date: Optional[str] = None
    tags: List[str] = None
    
    def __post_init__(self):
        """Initialize default values."""
        if self.tags is None:
            self.tags = []
        if not self.created_at:
            self.created_at = datetime.now().isoformat()
    
    def to_dict(self) -> Dict:
        """Convert task to dictionary."""
        return asdict(self)
    
    def is_overdue(self) -> bool:
        """Check if task is overdue."""
        if not self.due_date or self.status == "completed":
            return False
        try:
            due = datetime.fromisoformat(self.due_date.replace('Z', '+00:00'))
            return due.date() < datetime.now().date()
        except (ValueError, AttributeError):
            return False


# Valid values for task fields
VALID_STATUSES = ["pending", "in_progress", "completed", "cancelled"]
VALID_PRIORITIES = ["low", "medium", "high"]
PRIORITY_ORDER = {"high": 0, "medium": 1, "low": 2}

