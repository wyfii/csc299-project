"""Task manager implementation used for CSC299 Task 3."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass, field, asdict
from datetime import date, datetime, timedelta
from typing import Any, Dict, Iterable, Iterator, List, Optional, Sequence


def _utc_now() -> str:
    """Return the current UTC timestamp in ISO-8601 format."""
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


@dataclass(slots=True)
class Task:
    """Representation of a single task."""

    id: int
    title: str
    description: str = ""
    priority: str = "medium"
    status: str = "pending"
    tags: List[str] = field(default_factory=list)
    project: Optional[str] = None
    due_date: Optional[str] = None
    created_at: str = field(default_factory=_utc_now)
    updated_at: str = field(default_factory=_utc_now)
    completed_at: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert the task into a JSON-serialisable dictionary."""
        payload = asdict(self)
        payload["tags"] = list(self.tags)
        return payload

    @classmethod
    def from_dict(cls, payload: Dict[str, Any]) -> "Task":
        """Create a Task from a persisted dictionary."""
        data = payload.copy()
        data["tags"] = list(data.get("tags", []))
        return cls(**data)


class TaskManager:
    """Manage tasks with persistence and filtering helpers."""

    PRIORITIES: Sequence[str] = ("low", "medium", "high")
    STATUSES: Sequence[str] = ("pending", "in_progress", "completed")

    def __init__(self, data_file: str = "tasks.json") -> None:
        self.data_file = data_file
        self._tasks: List[Task] = []
        self._load_from_disk()

    # ------------------------------------------------------------------ Public API
    def add_task(
        self,
        *,
        title: str,
        description: str = "",
        priority: str = "medium",
        status: str = "pending",
        tags: Optional[Iterable[str]] = None,
        project: Optional[str] = None,
        due_date: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a new task and return its serialised representation."""
        title = title.strip()
        if not title:
            raise ValueError("title must not be empty")

        priority = self._validate_priority(priority)
        status = self._validate_status(status)
        parsed_due = self._parse_due_date(due_date) if due_date else None

        task = Task(
            id=self._next_id(),
            title=title,
            description=description.strip(),
            priority=priority,
            status=status,
            tags=self._clean_tags(tags),
            project=project.strip() if project else None,
            due_date=parsed_due,
        )

        if status == "completed":
            task.completed_at = _utc_now()

        self._tasks.append(task)
        self._persist()
        return task.to_dict()

    def update_task(
        self,
        task_id: int,
        *,
        title: Optional[str] = None,
        description: Optional[str] = None,
        priority: Optional[str] = None,
        status: Optional[str] = None,
        tags: Optional[Iterable[str]] = None,
        project: Optional[str] = None,
        due_date: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Update an existing task."""
        task = self._get_task(task_id)

        if title is not None:
            stripped = title.strip()
            if not stripped:
                raise ValueError("title must not be empty")
            task.title = stripped

        if description is not None:
            task.description = description.strip()

        if priority is not None:
            task.priority = self._validate_priority(priority)

        if status is not None:
            new_status = self._validate_status(status)
            if new_status == "completed" and task.completed_at is None:
                task.completed_at = _utc_now()
            elif new_status != "completed":
                task.completed_at = None
            task.status = new_status

        if tags is not None:
            task.tags = self._clean_tags(tags)

        if project is not None:
            task.project = project.strip() if project else None

        if due_date is not None:
            task.due_date = self._parse_due_date(due_date) if due_date else None

        task.updated_at = _utc_now()
        self._persist()
        return task.to_dict()

    def delete_task(self, task_id: int) -> None:
        """Remove a task from the collection."""
        index = self._index_for(task_id)
        del self._tasks[index]
        self._persist()

    def clear_storage(self) -> None:
        """Remove all tasks and delete the backing file."""
        self._tasks.clear()
        if os.path.exists(self.data_file):
            os.remove(self.data_file)

    def iter_tasks(self, *, order_by: str = "id") -> Iterator[Dict[str, Any]]:
        """Iterate over tasks in a deterministic order."""
        if order_by == "id":
            ordered = sorted(self._tasks, key=lambda task: task.id)
        elif order_by == "priority":
            priority_rank = {value: index for index, value in enumerate(self.PRIORITIES)}
            ordered = sorted(
                self._tasks,
                key=lambda task: (priority_rank.get(task.priority, len(priority_rank)), task.id),
            )
        elif order_by == "due":
            ordered = sorted(
                self._tasks,
                key=lambda task: (
                    task.due_date is None,
                    task.due_date or "",
                    task.id,
                ),
            )
        else:
            raise ValueError(f"unsupported order_by value: {order_by}")

        for task in ordered:
            yield task.to_dict()

    def filter_tasks(
        self,
        *,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        tag: Optional[str] = None,
        project: Optional[str] = None,
        overdue: bool = False,
    ) -> List[Dict[str, Any]]:
        """Return tasks that match the provided filters."""
        filtered = list(self.iter_tasks())

        if status:
            validated = self._validate_status(status)
            filtered = [task for task in filtered if task["status"] == validated]

        if priority:
            validated = self._validate_priority(priority)
            filtered = [task for task in filtered if task["priority"] == validated]

        if tag:
            lowered = tag.lower()
            filtered = [
                task for task in filtered if any(t.lower() == lowered for t in task["tags"])
            ]

        if project:
            lowered = project.lower()
            filtered = [
                task
                for task in filtered
                if task["project"] and lowered in task["project"].lower()
            ]

        if overdue:
            today = date.today().isoformat()
            filtered = [
                task
                for task in filtered
                if task["due_date"]
                and task["due_date"] < today
                and task["status"] != "completed"
            ]

        return filtered

    def get_statistics(self) -> Dict[str, int]:
        """Return a summary of the task collection."""
        total = len(self._tasks)
        counts = {status: 0 for status in self.STATUSES}
        for task in self._tasks:
            counts[task.status] += 1
        counts["total"] = total
        return counts

    def render_task(self, task: Dict[str, Any]) -> str:
        """Create a human-readable representation of a task."""
        lines = [
            f"[#{task['id']}] {task['title']} ({task['priority']})",
            f"   status     : {task['status']}",
        ]

        if task["description"]:
            lines.append(f"   description: {task['description']}")

        if task["project"]:
            lines.append(f"   project    : {task['project']}")

        if task["tags"]:
            lines.append(f"   tags       : {', '.join(task['tags'])}")

        if task["due_date"]:
            lines.append(f"   due date   : {task['due_date']}")

        lines.append(f"   updated    : {task['updated_at']}")
        return "\n".join(lines)

    @property
    def tasks(self) -> List[Dict[str, Any]]:
        """Expose tasks as serialised dictionaries for consumers/tests."""
        return list(self.iter_tasks())

    # ------------------------------------------------------------------ Helpers
    def _load_from_disk(self) -> None:
        if not os.path.exists(self.data_file):
            self._tasks = []
            return

        try:
            with open(self.data_file, "r", encoding="utf-8") as handle:
                raw = json.load(handle)
        except (json.JSONDecodeError, OSError):
            self._tasks = []
            return

        self._tasks = [Task.from_dict(item) for item in raw]

    def _persist(self) -> None:
        directory = os.path.dirname(self.data_file)
        if directory and not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)

        with open(self.data_file, "w", encoding="utf-8") as handle:
            json.dump([task.to_dict() for task in self._tasks], handle, indent=2)

    def _next_id(self) -> int:
        return (max((task.id for task in self._tasks), default=0) + 1)

    def _validate_priority(self, value: str) -> str:
        lowered = value.lower()
        if lowered not in self.PRIORITIES:
            readable = ", ".join(self.PRIORITIES)
            raise ValueError(f"priority must be one of: {readable}")
        return lowered

    def _validate_status(self, value: str) -> str:
        lowered = value.lower()
        if lowered not in self.STATUSES:
            readable = ", ".join(self.STATUSES)
            raise ValueError(f"status must be one of: {readable}")
        return lowered

    def _clean_tags(self, tags: Optional[Iterable[str]]) -> List[str]:
        if not tags:
            return []
        deduped: List[str] = []
        for tag in tags:
            clean = tag.strip()
            if clean and clean not in deduped:
                deduped.append(clean)
        return deduped

    def _parse_due_date(self, value: str) -> str:
        text = value.strip().lower()
        today = date.today()

        if text == "today":
            target = today
        elif text == "tomorrow":
            target = today + timedelta(days=1)
        elif text.startswith("+"):
            target = self._parse_plus_notation(text, today)
        elif text.startswith("next "):
            target = self._parse_next_phrase(text, today)
        else:
            try:
                target = datetime.strptime(text, "%Y-%m-%d").date()
            except ValueError as exc:
                raise ValueError("due_date must be ISO format or a supported relative phrase") from exc
        return target.isoformat()

    def _parse_plus_notation(self, text: str, today: date) -> date:
        suffix = text[-1]
        if suffix not in {"d", "w"}:
            raise ValueError("relative due dates must end with 'd' or 'w' (e.g. +3d, +1w)")

        try:
            amount = int(text[1:-1])
        except ValueError as exc:
            raise ValueError("relative due date must include an integer amount") from exc

        delta_days = amount if suffix == "d" else amount * 7
        return today + timedelta(days=delta_days)

    def _parse_next_phrase(self, text: str, today: date) -> date:
        phrase = text[5:]
        if phrase == "week":
            return today + timedelta(days=7)
        if phrase == "month":
            # Approximate a month as 30 days for this assignment
            return today + timedelta(days=30)
        raise ValueError("supported 'next' phrases: 'next week', 'next month'")

    def _get_task(self, task_id: int) -> Task:
        index = self._index_for(task_id)
        return self._tasks[index]

    def _index_for(self, task_id: int) -> int:
        for index, task in enumerate(self._tasks):
            if task.id == task_id:
                return index
        raise LookupError(f"task with id {task_id} was not found")

