# Setup Guide for TaskMaster

## Quick Start (No API Key Needed!)

TaskMaster works perfectly **without** an API key. AI features are optional!

```bash
cd final
uv sync
uv run taskmaster
```

That's it! You can use all core features.

## Optional: Enable AI Features

If you want AI-powered task summarization, you need an OpenAI API key.

### Step 1: Get an API Key

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-proj-...`)

### Step 2: Set Environment Variable

**Option A: Temporary (Current Session Only)**

```bash
export OPENAI_API_KEY="sk-proj-your-actual-key-here"
uv run taskmaster
```

**Option B: Permanent (Recommended)**

```bash
# Add to your shell profile
echo 'export OPENAI_API_KEY="sk-proj-your-actual-key-here"' >> ~/.zshrc

# Reload shell
source ~/.zshrc

# Now it's always available
uv run taskmaster
```

**Option C: .env File (Not recommended for this project)**

We don't use .env files in this project to avoid accidental commits.
Use shell environment variables instead.

### Step 3: Verify AI Features

```bash
uv run taskmaster

TaskMaster> ai I need to prepare slides and practice my presentation
🤖 AI suggested title: Prepare and practice presentation
Create task with this title? (y/n): y
✓ Task added successfully
```

## Security Notes

✅ **CORRECT**: Environment variable (`export OPENAI_API_KEY=...`)
❌ **WRONG**: Hardcoding in code
❌ **WRONG**: Committing to git

Your API key should:
- ✅ Be in your shell environment
- ✅ Stay on your local machine
- ✅ NEVER be committed to git
- ✅ NEVER be hardcoded in Python files

## Troubleshooting

### "AI features not available"

This message means no API key was found. AI features are disabled, but everything else works!

To enable AI:
```bash
export OPENAI_API_KEY="your-key"
```

### "Permission denied"

Make sure you have write permissions:
```bash
chmod +x src/taskmaster/*.py
```

### "Module not found"

Reinstall dependencies:
```bash
uv sync
```

## What Works Without API Key

Everything except the `ai` command:
- ✅ Add tasks
- ✅ List tasks (with colors!)
- ✅ Update status
- ✅ Search
- ✅ Statistics
- ✅ CSV export
- ✅ All chat features

## Development Setup

```bash
# Clone and setup
cd final
uv sync

# Run tests
uv run pytest -v

# Start app
uv run taskmaster
```

## For Grading/Demo

You can demonstrate the entire project **without** an API key!

Just note in your video: "AI features are optional and require an OpenAI API key. I'm demonstrating without one to keep keys secure."

---

**Remember: Never commit API keys! Always use environment variables!** 🔒

