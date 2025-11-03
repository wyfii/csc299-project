#!/bin/bash
# Demo script to showcase all Task Manager features

echo "=========================================="
echo "TASK MANAGER DEMO"
echo "=========================================="
echo ""

# Clean up any existing data
rm -f tasks.json

echo "1. Adding tasks with various attributes..."
python3 task_manager.py add "Study for exam" "Chapters 1-5" high --due 2025-11-10 --tags school,urgent
python3 task_manager.py add "Submit assignment" "CSC299 Task 2" high --due 2025-11-15 --tags school,deadline
python3 task_manager.py add "Buy textbook" "" medium --tags school,shopping
python3 task_manager.py add "Gym workout" "Cardio and weights" low --tags health,personal
python3 task_manager.py add "Team meeting" "Sprint planning" medium --due 2025-11-08 --tags work,meeting
echo ""

echo "2. Listing all tasks..."
python3 task_manager.py list
echo ""

echo "3. Listing tasks sorted by priority..."
python3 task_manager.py list --sort-by priority
echo ""

echo "4. Viewing detailed task information..."
python3 task_manager.py view 1
echo ""

echo "5. Editing a task..."
python3 task_manager.py edit 3 --description "Introduction to Algorithms textbook" --priority high
echo ""

echo "6. Updating task statuses..."
python3 task_manager.py update 1 in_progress
python3 task_manager.py update 5 completed
echo ""

echo "7. Searching for tasks..."
python3 task_manager.py search "exam"
echo ""

echo "8. Viewing task statistics..."
python3 task_manager.py stats
echo ""

echo "9. Exporting tasks to CSV..."
python3 task_manager.py export demo_tasks.csv
head -3 demo_tasks.csv
echo "..."
echo ""

echo "10. Listing only pending tasks..."
python3 task_manager.py list pending
echo ""

echo "11. Clearing completed tasks..."
python3 task_manager.py clear-completed
echo ""

echo "12. Final task list..."
python3 task_manager.py list
echo ""

echo "=========================================="
echo "DEMO COMPLETE!"
echo "=========================================="
echo ""
echo "Clean up demo files with:"
echo "  rm -f tasks.json demo_tasks.csv"

