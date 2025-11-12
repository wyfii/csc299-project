# Task 4 – AI Task Summaries

This experiment uses the OpenAI Python SDK to collapse paragraph-length task descriptions into concise action phrases.

## Flow
```
Long description ──► OpenAI Responses API ──► Short action phrase
```

## Setup
1. Create an API key at https://platform.openai.com/api-keys  
2. Export it before running the script:
   ```bash
   export OPENAI_API_KEY="sk-your-key"
   ```
3. Run the summariser:
   ```bash
   uv run task4
   ```

## What the script does
- Defines `summarize_task()` which calls the OpenAI Responses endpoint
- Handles missing API keys with explicit error messaging
- Iterates over multiple sample paragraphs and prints the generated summaries
- Keeps logic encapsulated in a small `TaskSummarizer` helper class

## Requirements
- Python 3.11+
- An OpenAI API key
- `uv` to run `uv run task4`

`openai` is the only runtime dependency, declared in `pyproject.toml`.

