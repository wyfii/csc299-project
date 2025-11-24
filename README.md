# CSC299 Final Project - Task Management System

A progressive exploration of software development through 6 iterations of a task manager, culminating in a production-ready chat interface application.

---

## 📂 Project Structure

```
csc299-project-1/
├── README.md           # This file
├── SUMMARY.md          # Development process explanation
├── video.txt           # YouTube demo video URL
│
├── task1/              # Iteration 1: Basic CLI
├── task2/              # Iteration 2: Enhanced + Tests
├── task3/              # Iteration 3: Professional Package
├── task4/              # Iteration 4: AI Integration
├── task5/              # Iteration 5: Spec-Driven Development
│
└── final/              # ⭐ FINAL VERSION - Production Ready
    ├── src/taskmaster/ # Modular codebase (7 files)
    ├── tests/          # 39 comprehensive tests
    └── README.md       # Complete documentation
```

---

## 🎯 The Final Version

The **`final/`** directory contains the production-ready application that combines all learnings:

### Features
- 💬 **Interactive Chat Interface** - Continuous REPL, not one-shot commands
- 🎨 **Beautiful Colored Terminal** - Priority-coded, status-coded output
- 🤖 **Optional AI Integration** - OpenAI-powered task suggestions
- 📊 **Rich Features** - Due dates, tags, statistics, CSV export
- 🔐 **Secure** - No hardcoded secrets, environment variables only
- ✅ **Well-Tested** - 39 passing tests
- 📚 **Professional Code** - 7 focused modules, clean architecture

### Quick Start
```bash
cd final
uv sync
uv run taskmaster
```

See `final/README.md` for complete documentation.

---

## 🔄 Development Progression

Each task directory represents a learning milestone:

| Task | Focus | Key Learning |
|------|-------|--------------|
| 1 | Basic CLI | JSON persistence, Python basics |
| 2 | Enhanced + Tests | Test-driven development, advanced features |
| 3 | Package Structure | Modern Python tooling (uv, pyproject.toml) |
| 4 | AI Integration | API integration, security best practices |
| 5 | Spec-Driven | Formal specifications, planning before coding |
| **Final** | **Production** | **Synthesis, chat interface, professional quality** |

---

## 📖 Documentation

- **`SUMMARY.md`** - Detailed explanation of my development process, AI tool usage, and learnings
- **`final/README.md`** - Complete user guide for the final application
- **`final/ABOUT.md`** - Why this is the "final" version
- **`video.txt`** - Link to demonstration video (6-8 minutes)

---

## 🛠️ Technologies Used

- **Python 3.11+** - Core language
- **uv** - Modern package manager
- **pytest** - Testing framework
- **OpenAI API** - AI features (optional)
- **Git** - Version control with fine-grained commits
- **ANSI Colors** - Terminal UI (no external dependencies)

---

## 🔐 Security

All sensitive data (API keys) are handled via environment variables. No secrets are committed to this repository.

See `final/SECURITY.md` for details.

---

## 🧪 Testing

```bash
# Run all tests for final version
cd final
uv run pytest -v

# Run tests for Task 2
cd task2
python3 test_task_manager.py

# Run tests for Task 3
cd task3
uv run pytest
```

---

## 📊 Project Stats

- **Total Lines of Code**: ~3,500 across all versions
- **Test Cases**: 90+ total (39 in final version)
- **Development Time**: ~24 hours
- **Git Commits**: 10+ showing progressive development
- **Modules**: 7 in final version (clean separation of concerns)

---

## 🎓 Course Context

**Course**: CSC299  
**Institution**: DePaul University  
**Semester**: Fall 2025  
**Project Type**: Final Project - Task Management System with AI Integration

### Requirements Met
- ✅ Final version of software (production-ready in `final/`)
- ✅ Fine-grained commit history
- ✅ Multiple prototypes showing iteration
- ✅ Development process summary (SUMMARY.md)
- ✅ Demonstration video (video.txt)
- ✅ Comprehensive documentation

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11 or higher
- [uv](https://docs.astral.sh/uv/) package manager

### Run the Final Version
```bash
# Clone the repository
cd csc299-project-1/final

# Install dependencies
uv sync

# Start the interactive chat interface
uv run taskmaster
```

### Try the Prototypes
```bash
# Task 1 - Basic
cd task1
python3 task_manager.py add "Test" "Demo" high
python3 task_manager.py list

# Task 2 - Enhanced
cd task2
python3 task_manager.py add "Test" "Demo" high --tags work --due 2025-12-01
python3 -m pytest test_task_manager.py -v

# Task 3 - Packaged
cd task3
uv run task3

# Task 5 - Spec-driven
cd task5
python3 task_manager.py help
```

---

## 📝 Key Learnings

1. **AI as Amplifier** - AI tools accelerate development but don't replace thinking
2. **Testing Matters** - Comprehensive tests catch bugs and enable confident refactoring
3. **Structure First** - Good architecture makes code maintainable
4. **Iterate & Improve** - Each version taught lessons applied to the next
5. **Security Counts** - Never hardcode secrets, always use environment variables

---

## 📺 Demonstration

A 6-8 minute video demonstration is available showing:
- All 5 task iterations
- Final version with chat interface
- Testing and code quality
- Git history and development process

URL: See `video.txt`

---

## 📄 License

Educational project for CSC299 coursework.

---

**November 2025**

