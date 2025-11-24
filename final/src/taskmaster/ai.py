"""
AI integration for TaskMaster.
Provides optional AI-powered task summarization using OpenAI.
"""

from __future__ import annotations

import os
from typing import Optional


class AITaskSummarizer:
    """Optional AI-powered task summarization using OpenAI."""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the AI summarizer."""
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = None
        
        if self.api_key:
            try:
                from openai import OpenAI
                self.client = OpenAI(api_key=self.api_key)
            except ImportError:
                pass  # Silently fail if OpenAI not installed
    
    def is_available(self) -> bool:
        """Check if AI summarization is available."""
        return self.client is not None
    
    def summarize(self, text: str) -> Optional[str]:
        """Summarize text using OpenAI API."""
        if not self.is_available():
            return None
        
        try:
            response = self.client.responses.create(
                model="gpt-4o-mini",
                input=[
                    {
                        "role": "system",
                        "content": (
                            "You read a task description and answer with a concise, "
                            "action-oriented phrase containing between three and eight words."
                        ),
                    },
                    {"role": "user", "content": text},
                ],
                max_output_tokens=60,
                temperature=0.2,
            )
            return response.output_text.strip()
        except Exception:
            return None  # Fail gracefully

