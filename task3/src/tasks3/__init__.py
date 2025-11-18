"""Public interface for the Task 3 package."""

from __future__ import annotations

from .task_manager import TaskManager


def inc(value: int) -> int:
    """Return the value incremented by one."""
    return value + 1


def main() -> None:
    """Small demo showcasing the task manager features."""
    print("=" * 72)
    print("CSC299 Task 3 – Task Manager Demo")
    print("=" * 72)
    print("\nCreating a demo task list (stored in demo_tasks.json)...\n")

    manager = TaskManager(data_file="demo_tasks.json")
    manager.clear_storage()

    manager.add_task(
        title="Draft project outline",
        description="Sketch milestones and dependencies",
        priority="high",
        tags=["school", "csc299"],
        due_date="tomorrow",
    )
    manager.add_task(
        title="Collect research papers",
        description="Gather three references about task management tooling",
        priority="medium",
        project="Semester Project",
        tags=["reading"],
        due_date="+3d",
    )
    manager.add_task(
        title="Check in with group",
        description="Share outline and confirm ownership of milestone deliverables",
        priority="medium",
        status="in_progress",
        due_date="next week",
    )

    print("Current tasks:\n")
    for task in manager.iter_tasks(order_by="priority"):
        print(manager.render_task(task))
        print("-" * 72)

    stats = manager.get_statistics()
    print("Summary:")
    print(f"  Total tasks     : {stats['total']}")
    print(f"  Pending         : {stats['pending']}")
    print(f"  In progress     : {stats['in_progress']}")
    print(f"  Completed       : {stats['completed']}")

    print("\nRun `uv run pytest` to execute the tests that accompany this package.")




