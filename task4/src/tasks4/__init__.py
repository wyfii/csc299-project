"""OpenAI-powered task summarisation for CSC299 Task 4."""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Iterable, List

from openai import OpenAI


def inc(value: int) -> int:
    """Return value incremented by one (assignment convention)."""
    return value + 1


@dataclass
class TaskSummarizer:
    """Wrap the OpenAI client to generate short task summaries."""

    client: OpenAI
    model: str = "gpt-4o-mini"
    temperature: float = 0.2

    def summarize(self, description: str) -> str:
        """Summarise a single task description."""
        response = self.client.responses.create(
            model=self.model,
            input=[
                {
                    "role": "system",
                    "content": (
                        "You read a task description and answer with a concise, action-oriented "
                        "phrase containing between three and eight words."
                    ),
                },
                {"role": "user", "content": description},
            ],
            max_output_tokens=60,
            temperature=self.temperature,
        )
        return response.output_text.strip()


def summarize_task(description: str, *, api_key: str | None = None) -> str:
    """Helper that builds a client (using env var fallback) and summarises the text."""
    key = api_key or os.getenv("OPENAI_API_KEY")
    if not key:
        raise RuntimeError(
            "OPENAI_API_KEY is not set. Export it or pass api_key explicitly."
        )
    summarizer = TaskSummarizer(client=OpenAI(api_key=key))
    return summarizer.summarize(description)


def main() -> None:
    """Entry point for `uv run task4`."""
    print("=" * 74)
    print("CSC299 Task 4 – AI Task Summaries")
    print("=" * 74)
    print("\nThis script turns long task descriptions into short actionable phrases.\n")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("⚠️  OPENAI_API_KEY is not set. Summaries will fail until you export it.")
    else:
        print("✅ Found OPENAI_API_KEY in your environment.")

    descriptions: List[str] = [
        (
            "I am leading a capstone project for CSC299. The team needs a roadmap, "
            "a weekly status report template, and a clear risk log before our advisor "
            "check-in on Friday."
        ),
        (
            "Next week I interview with a startup. I want to review system design topics, "
            "rehearse behavioural questions with a friend, and produce a concise project "
            "portfolio to share with the panel."
        ),
    ]

    if not api_key:
        print("\nSkipping API calls; export your key and run the script again.")
        return

    summarizer = TaskSummarizer(client=OpenAI(api_key=api_key))

    for index, paragraph in enumerate(descriptions, start=1):
        print("\n" + "-" * 74)
        print(f"Task description #{index}")
        print("-" * 74)
        print(paragraph)

        try:
            summary = summarizer.summarize(paragraph)
        except Exception as exc:  # pragma: no cover - depends on network
            print(f"\n❌ Failed to summarise: {exc}")
            continue

        print("\n🤖 Summary:")
        print(summary)

    print("\nFinished processing descriptions.")




