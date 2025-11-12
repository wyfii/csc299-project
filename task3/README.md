# Task 3 – Packaged Task Manager

This directory contains a fresh implementation of the CSC299 task manager assignment packaged with `uv` and covered by tests.

## Highlights
- Python package layout under `src/`
- Persists tasks to JSON with validation for priority, status, and due dates
- Relative due date helpers (`today`, `tomorrow`, `+3d`, `next week`, etc.)
- Rich filtering for status, priority, project, and tags
- Statistics helper for pending/in-progress/completed counts
- Fully tested with `pytest`

## Getting Started
```bash
# Run the interactive demo
uv run task3

# Execute the test suite
uv run pytest
```

The demo writes to `demo_tasks.json` so it will not touch your real data.

## Project Layout
```
task3/
├── pyproject.toml
├── README.md
├── src/
│   └── tasks3/
│       ├── __init__.py
│       └── task_manager.py
└── tests/
    ├── test_inc.py
    └── test_task_manager.py
```

## Requirements
- Python 3.11+
- [uv](https://docs.astral.sh/uv/) for dependency management

`pytest` is pulled in through the development dependency group when you run `uv run pytest`.

