"""
Interactive chat-style interface for TaskMaster.
Provides a REPL (Read-Eval-Print Loop) for continuous task management.
"""

from typing import List, Optional
import sys

from .manager import TaskManager
from .display import (
    print_welcome, print_prompt, print_task_list, 
    print_task_details, print_statistics,
    success, error, warning, info, colorize, Colors, print_header
)


class TaskMasterChat:
    """Interactive chat interface for TaskMaster."""
    
    def __init__(self, data_file: str = "tasks.json"):
        """Initialize the chat interface."""
        self.manager = TaskManager(data_file)
        self.running = True
    
    def start(self):
        """Start the interactive chat session."""
        print_welcome()
        
        # Show quick stats on startup
        if self.manager.tasks:
            stats = self.manager.get_statistics()
            print(info(f"You have {stats['total']} task(s) in your system."))
            if stats.get('overdue', 0) > 0:
                print(warning(f"{stats['overdue']} task(s) are overdue!"))
            print()
        
        while self.running:
            try:
                command = input(print_prompt()).strip()
                
                if not command:
                    continue
                
                self.process_command(command)
                
            except KeyboardInterrupt:
                print(f"\n{info('Use exit or quit to leave TaskMaster')}")
            except EOFError:
                break
        
        print(f"\n{success('Goodbye! Stay organized! 👋')}\n")
    
    def process_command(self, command: str):
        """Process a user command."""
        parts = command.split()
        if not parts:
            return
        
        cmd = parts[0].lower()
        args = parts[1:]
        
        # Route to appropriate handler
        if cmd in ['exit', 'quit', 'q']:
            self.running = False
        elif cmd in ['help', 'h', '?']:
            self.show_help()
        elif cmd in ['add', 'new', 'create']:
            self.cmd_add(args)
        elif cmd in ['list', 'ls', 'show']:
            self.cmd_list(args)
        elif cmd in ['view', 'show', 'details']:
            self.cmd_view(args)
        elif cmd in ['update', 'status']:
            self.cmd_update_status(args)
        elif cmd in ['edit', 'modify']:
            self.cmd_edit(args)
        elif cmd in ['delete', 'del', 'remove', 'rm']:
            self.cmd_delete(args)
        elif cmd in ['search', 'find']:
            self.cmd_search(args)
        elif cmd in ['stats', 'statistics']:
            self.cmd_stats()
        elif cmd in ['export']:
            self.cmd_export(args)
        elif cmd in ['clear', 'clear-completed']:
            self.cmd_clear_completed()
        elif cmd in ['ai']:
            self.cmd_ai_suggest(args)
        else:
            print(error(f"Unknown command: {cmd}"))
            print(info("Type 'help' for available commands"))
    
    def cmd_add(self, args: List[str]):
        """Add a new task."""
        if not args:
            print(warning("Usage: add <title> [description] [priority] [--due DATE] [--tags TAG1,TAG2]"))
            title = input(colorize("Task title: ", Colors.CYAN)).strip()
            if not title:
                print(error("Title cannot be empty"))
                return
            
            description = input(colorize("Description (optional): ", Colors.CYAN)).strip()
            priority = input(colorize("Priority (low/medium/high, default=medium): ", Colors.CYAN)).strip() or "medium"
            due_date = input(colorize("Due date (YYYY-MM-DD, optional): ", Colors.CYAN)).strip() or None
            tags_input = input(colorize("Tags (comma-separated, optional): ", Colors.CYAN)).strip()
            tags = [t.strip() for t in tags_input.split(",")] if tags_input else None
            
            self.manager.add_task(title, description, priority, due_date, tags)
        else:
            # Parse command-line style
            title = args[0] if args else ""
            description = args[1] if len(args) > 1 and not args[1].startswith("--") else ""
            priority = args[2] if len(args) > 2 and not args[2].startswith("--") else "medium"
            
            due_date = None
            tags = None
            
            for i, arg in enumerate(args):
                if arg == "--due" and i + 1 < len(args):
                    due_date = args[i + 1]
                elif arg == "--tags" and i + 1 < len(args):
                    tags = [t.strip() for t in args[i + 1].split(",")]
            
            self.manager.add_task(title, description, priority, due_date, tags)
    
    def cmd_list(self, args: List[str]):
        """List tasks."""
        status_filter = args[0] if args and args[0] not in ["--sort-by", "--tag"] else None
        sort_by = "id"
        tag_filter = None
        
        i = 0
        while i < len(args):
            if args[i] == "--sort-by" and i + 1 < len(args):
                sort_by = args[i + 1]
                i += 2
            elif args[i] == "--tag" and i + 1 < len(args):
                tag_filter = args[i + 1]
                i += 2
            else:
                i += 1
        
        tasks = self.manager.list_tasks(status_filter, sort_by, tag_filter)
        print_task_list(tasks)
    
    def cmd_view(self, args: List[str]):
        """View task details."""
        if not args:
            print(error("Usage: view <task_id>"))
            return
        
        try:
            task_id = int(args[0])
            task = self.manager.get_task(task_id)
            if task:
                print_task_details(task)
            else:
                print(error(f"Task {task_id} not found"))
        except ValueError:
            print(error("Task ID must be a number"))
    
    def cmd_update_status(self, args: List[str]):
        """Update task status."""
        if len(args) < 2:
            print(error("Usage: update <task_id> <status>"))
            print(info("Valid statuses: pending, in_progress, completed, cancelled"))
            return
        
        try:
            task_id = int(args[0])
            new_status = args[1]
            self.manager.update_status(task_id, new_status)
        except ValueError:
            print(error("Task ID must be a number"))
    
    def cmd_edit(self, args: List[str]):
        """Edit a task."""
        if not args:
            print(error("Usage: edit <task_id> [--title TEXT] [--description TEXT] [--priority LEVEL] [--due DATE] [--tags TAG1,TAG2]"))
            return
        
        try:
            task_id = int(args[0])
            
            title = None
            description = None
            priority = None
            due_date = None
            tags = None
            
            i = 1
            while i < len(args):
                if args[i] == "--title" and i + 1 < len(args):
                    title = args[i + 1]
                    i += 2
                elif args[i] == "--description" and i + 1 < len(args):
                    description = args[i + 1]
                    i += 2
                elif args[i] == "--priority" and i + 1 < len(args):
                    priority = args[i + 1]
                    i += 2
                elif args[i] == "--due" and i + 1 < len(args):
                    due_date = args[i + 1]
                    i += 2
                elif args[i] == "--tags" and i + 1 < len(args):
                    tags = [t.strip() for t in args[i + 1].split(",")]
                    i += 2
                else:
                    i += 1
            
            self.manager.update_task(task_id, title, description, priority, due_date, tags)
        except ValueError:
            print(error("Task ID must be a number"))
    
    def cmd_delete(self, args: List[str]):
        """Delete a task."""
        if not args:
            print(error("Usage: delete <task_id>"))
            return
        
        try:
            task_id = int(args[0])
            task = self.manager.get_task(task_id)
            if task:
                confirm = input(colorize(f"Delete task '{task.title}'? (y/n): ", Colors.YELLOW)).lower()
                if confirm == 'y':
                    self.manager.delete_task(task_id)
            else:
                print(error(f"Task {task_id} not found"))
        except ValueError:
            print(error("Task ID must be a number"))
    
    def cmd_search(self, args: List[str]):
        """Search for tasks."""
        if not args:
            print(error("Usage: search <query>"))
            return
        
        query = " ".join(args)
        tasks = self.manager.search_tasks(query)
        print(f"\n{info(f'Search results for: {query}')}")
        print_task_list(tasks)
    
    def cmd_stats(self):
        """Show statistics."""
        stats = self.manager.get_statistics()
        print_statistics(stats)
    
    def cmd_export(self, args: List[str]):
        """Export tasks to CSV."""
        filename = args[0] if args else "tasks_export.csv"
        self.manager.export_to_csv(filename)
    
    def cmd_clear_completed(self):
        """Clear completed tasks."""
        confirm = input(colorize("Remove all completed tasks? (y/n): ", Colors.YELLOW)).lower()
        if confirm == 'y':
            self.manager.clear_completed()
        else:
            print(info("Operation cancelled"))
    
    def cmd_ai_suggest(self, args: List[str]):
        """Use AI to suggest a task title from description."""
        if not self.manager.ai_summarizer.is_available():
            print(warning("AI features not available. Set OPENAI_API_KEY environment variable."))
            return
        
        if not args:
            description = input(colorize("Enter task description: ", Colors.CYAN)).strip()
        else:
            description = " ".join(args)
        
        if not description:
            print(error("Description cannot be empty"))
            return
        
        print(info("Asking AI for suggestion..."))
        suggestion = self.manager.ai_summarizer.summarize(description)
        
        if suggestion:
            from .display import ai_message
            print(ai_message(f"Suggested title: {suggestion}"))
            create = input(colorize("Create task with this title? (y/n): ", Colors.CYAN)).lower()
            if create == 'y':
                self.manager.add_task(suggestion, description)
        else:
            print(error("AI summarization failed"))
    
    def show_help(self):
        """Show help information."""
        print_header("TaskMaster Commands", 80)
        
        commands = [
            ("Task Management", [
                ("add, new, create", "Add a new task"),
                ("list, ls", "List tasks (optionally filter by status)"),
                ("view, details <id>", "View task details"),
                ("update, status <id> <status>", "Update task status"),
                ("edit, modify <id>", "Edit task fields"),
                ("delete, del, rm <id>", "Delete a task"),
            ]),
            ("Search & Analysis", [
                ("search, find <query>", "Search tasks by keyword"),
                ("stats, statistics", "Show task statistics"),
            ]),
            ("AI Features", [
                ("ai [description]", "Get AI suggestion for task title"),
            ]),
            ("Data Management", [
                ("export [filename]", "Export tasks to CSV"),
                ("clear, clear-completed", "Remove all completed tasks"),
            ]),
            ("System", [
                ("help, h, ?", "Show this help message"),
                ("exit, quit, q", "Exit TaskMaster"),
            ]),
        ]
        
        for category, cmds in commands:
            print(colorize(f"\n{category}:", Colors.CYAN + Colors.BOLD))
            for cmd, desc in cmds:
                cmd_colored = colorize(f"  {cmd:<30}", Colors.GREEN)
                print(f"{cmd_colored} {desc}")
        
        print(f"\n{colorize('Examples:', Colors.YELLOW + Colors.BOLD)}")
        examples = [
            'add "Buy groceries" "Milk, eggs, bread" low --due 2025-12-01 --tags personal',
            'list pending --sort-by priority',
            'update 1 in_progress',
            'search meeting',
            'ai Prepare slides for my presentation next week',
        ]
        for ex in examples:
            print(colorize(f"  TaskMaster> {ex}", Colors.GRAY))
        
        print()


def main():
    """Entry point for the chat interface."""
    chat = TaskMasterChat()
    chat.start()


if __name__ == "__main__":
    main()

