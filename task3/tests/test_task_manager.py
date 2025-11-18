from datetime import date, timedelta

import pytest

from tasks3.task_manager import TaskManager


@pytest.fixture()
def manager(tmp_path):
    data_file = tmp_path / "tasks.json"
    return TaskManager(data_file=str(data_file))


def test_add_task_assigns_ids_and_defaults(manager):
    first = manager.add_task(title="Write outline")
    second = manager.add_task(
        title="Review outline",
        description="Peer review with teammate",
        priority="high",
        tags=["school", "review"],
    )

    assert first["id"] == 1
    assert second["id"] == 2
    assert second["priority"] == "high"
    assert "school" in second["tags"]
    assert manager.get_statistics()["total"] == 2


def test_add_task_supports_relative_due_dates(manager):
    task = manager.add_task(title="Prepare slides", due_date="tomorrow")
    expected = (date.today() + timedelta(days=1)).isoformat()
    assert task["due_date"] == expected


def test_update_task_changes_status_and_timestamps(manager):
    task = manager.add_task(title="Draft email")
    updated = manager.update_task(task["id"], status="completed", priority="low")

    assert updated["status"] == "completed"
    assert updated["priority"] == "low"
    assert updated["completed_at"] is not None


def test_filter_tasks_by_status_and_tag(manager):
    manager.add_task(title="one", tags=["work"])
    second = manager.add_task(title="two", tags=["personal", "weekend"])
    manager.update_task(second["id"], status="in_progress")

    result = manager.filter_tasks(status="in_progress", tag="personal")
    assert len(result) == 1
    assert result[0]["title"] == "two"


def test_delete_task_removes_entry(manager):
    task = manager.add_task(title="Remove me")
    manager.delete_task(task["id"])

    assert manager.get_statistics()["total"] == 0
    assert manager.tasks == []


def test_invalid_priority_raises_error(manager):
    with pytest.raises(ValueError):
        manager.add_task(title="Invalid priority", priority="urgent")


def test_missing_task_raises_lookup(manager):
    with pytest.raises(LookupError):
        manager.update_task(999, title="does not exist")




