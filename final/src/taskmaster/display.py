"""
Display and formatting utilities for TaskMaster.
Provides colored output and pretty-printing functions.
"""

from typing import List, Dict
from .models import Task

# ANSI color codes
class Colors:
    """ANSI color codes for terminal output."""
    RESET = '\033[0m'
    BOLD = '\033[1m'
    DIM = '\033[2m'
    
    # Colors
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    GRAY = '\033[90m'
    
    # Backgrounds
    BG_RED = '\033[101m'
    BG_GREEN = '\033[102m'
    BG_YELLOW = '\033[103m'
    BG_BLUE = '\033[104m'


def colorize(text: str, color: str) -> str:
    """Wrap text with color codes."""
    return f"{color}{text}{Colors.RESET}"


def success(message: str) -> str:
    """Format success message."""
    return colorize(f"✓ {message}", Colors.GREEN)


def error(message: str) -> str:
    """Format error message."""
    return colorize(f"✗ {message}", Colors.RED)


def warning(message: str) -> str:
    """Format warning message."""
    return colorize(f"⚠️  {message}", Colors.YELLOW)


def info(message: str) -> str:
    """Format info message."""
    return colorize(f"ℹ️  {message}", Colors.BLUE)


def ai_message(message: str) -> str:
    """Format AI-related message."""
    return colorize(f"🤖 {message}", Colors.MAGENTA)


def priority_color(priority: str) -> str:
    """Get color for priority level."""
    colors = {
        "high": Colors.RED,
        "medium": Colors.YELLOW,
        "low": Colors.GREEN
    }
    return colors.get(priority.lower(), Colors.WHITE)


def status_color(status: str) -> str:
    """Get color for status."""
    colors = {
        "pending": Colors.GRAY,
        "in_progress": Colors.BLUE,
        "completed": Colors.GREEN,
        "cancelled": Colors.RED
    }
    return colors.get(status.lower(), Colors.WHITE)


def print_header(title: str, width: int = 80):
    """Print a colored header."""
    print(f"\n{colorize('=' * width, Colors.CYAN)}")
    print(colorize(f"  {title}", Colors.CYAN + Colors.BOLD))
    print(f"{colorize('=' * width, Colors.CYAN)}\n")


def print_separator(width: int = 80):
    """Print a separator line."""
    print(colorize("-" * width, Colors.GRAY))


def print_task_list(tasks: List[Task]) -> None:
    """Pretty-print a list of tasks with colors."""
    if not tasks:
        print(warning("No tasks found."))
        return
    
    # Header
    header = f"{'ID':<5} {'Title':<30} {'Priority':<10} {'Status':<15} {'Due Date':<12} {'Tags':<15}"
    print(f"\n{colorize(header, Colors.BOLD)}")
    print_separator(95)
    
    for task in tasks:
        # Overdue indicator
        overdue_mark = colorize("⚠️ ", Colors.RED) if task.is_overdue() else "   "
        
        # Truncate title
        title = task.title[:27] + "..." if len(task.title) > 30 else task.title
        
        # Color priority and status
        priority = colorize(task.priority.upper(), priority_color(task.priority))
        status = colorize(task.status.upper(), status_color(task.status))
        
        # Format tags
        tags_str = ",".join(task.tags[:2])
        if len(task.tags) > 2:
            tags_str += "..."
        
        # Due date
        due = task.due_date or "N/A"
        
        print(f"{task.id:<5} {overdue_mark}{title:<27} {priority:<18} {status:<23} "
              f"{due:<12} {colorize(tags_str, Colors.CYAN)}")
    
    print()


def print_task_details(task: Task) -> None:
    """Pretty-print detailed task information with colors."""
    print_header(f"Task #{task.id}", 70)
    
    print(f"{colorize('Title:', Colors.BOLD):<20} {task.title}")
    print(f"{colorize('Description:', Colors.BOLD):<20} {task.description or colorize('(none)', Colors.DIM)}")
    
    priority_colored = colorize(task.priority.upper(), priority_color(task.priority))
    print(f"{colorize('Priority:', Colors.BOLD):<20} {priority_colored}")
    
    status_colored = colorize(task.status.upper(), status_color(task.status))
    print(f"{colorize('Status:', Colors.BOLD):<20} {status_colored}")
    
    print(f"{colorize('Created:', Colors.BOLD):<20} {task.created_at}")
    print(f"{colorize('Completed:', Colors.BOLD):<20} {task.completed_at or colorize('Not completed', Colors.DIM)}")
    
    due_text = task.due_date or colorize('Not set', Colors.DIM)
    if task.is_overdue():
        due_text = f"{due_text} {colorize('⚠️  OVERDUE!', Colors.RED + Colors.BOLD)}"
    print(f"{colorize('Due Date:', Colors.BOLD):<20} {due_text}")
    
    tags_text = ', '.join(task.tags) if task.tags else colorize('(none)', Colors.DIM)
    print(f"{colorize('Tags:', Colors.BOLD):<20} {colorize(tags_text, Colors.CYAN)}")
    
    print(colorize("=" * 70, Colors.CYAN) + "\n")


def print_statistics(stats: Dict) -> None:
    """Pretty-print task statistics with colors."""
    total = stats.get("total", 0)
    if total == 0:
        print(warning("No tasks in the system."))
        return
    
    print_header("Task Statistics", 70)
    
    print(f"{colorize('Total Tasks:', Colors.BOLD)} {colorize(str(total), Colors.GREEN + Colors.BOLD)}\n")
    
    print(colorize("By Status:", Colors.BOLD))
    for status, count in stats.get("by_status", {}).items():
        percentage = (count / total) * 100
        bar_length = int(percentage / 2)
        bar = "█" * bar_length
        status_colored = colorize(status.capitalize().ljust(12), status_color(status))
        count_text = colorize(f"{count:>3}", Colors.WHITE + Colors.BOLD)
        percent_text = colorize(f"({percentage:>5.1f}%)", Colors.GRAY)
        bar_colored = colorize(bar, status_color(status))
        print(f"  {status_colored} {count_text} {percent_text} {bar_colored}")
    
    print(f"\n{colorize('By Priority:', Colors.BOLD)}")
    for priority, count in stats.get("by_priority", {}).items():
        percentage = (count / total) * 100
        bar_length = int(percentage / 2)
        bar = "█" * bar_length
        priority_colored = colorize(priority.capitalize().ljust(12), priority_color(priority))
        count_text = colorize(f"{count:>3}", Colors.WHITE + Colors.BOLD)
        percent_text = colorize(f"({percentage:>5.1f}%)", Colors.GRAY)
        bar_colored = colorize(bar, priority_color(priority))
        print(f"  {priority_colored} {count_text} {percent_text} {bar_colored}")
    
    overdue = stats.get("overdue", 0)
    if overdue > 0:
        print(f"\n{colorize('⚠️  Overdue Tasks:', Colors.RED + Colors.BOLD)} {colorize(str(overdue), Colors.RED + Colors.BOLD)}")
    
    tags = stats.get("tags", set())
    if tags:
        tags_text = ', '.join(sorted(tags))
        print(f"\n{colorize('Active Tags:', Colors.BOLD)} {colorize(tags_text, Colors.CYAN)}")
    
    print(colorize("=" * 70, Colors.CYAN) + "\n")


def print_welcome():
    """Print welcome banner."""
    banner = """
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║                 ✨ TaskMaster v1.0.0 ✨                            ║
║           AI-Enhanced Task Management System                       ║
║                                                                    ║
║           Type 'help' for commands, 'exit' to quit                ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
"""
    print(colorize(banner, Colors.CYAN + Colors.BOLD))


def print_prompt():
    """Print the command prompt."""
    return colorize("TaskMaster> ", Colors.GREEN + Colors.BOLD)

