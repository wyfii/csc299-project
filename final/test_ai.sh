#!/bin/bash
# Quick test script to verify AI integration

echo "========================================"
echo "Testing TaskMaster AI Integration"
echo "========================================"
echo ""

# Check if API key is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY is not set"
    echo ""
    echo "To test AI features, run:"
    echo "  export OPENAI_API_KEY='sk-your-key-here'"
    echo "  ./test_ai.sh"
    echo ""
    echo "Or just test without AI (all other features work!):"
    echo "  uv run taskmaster"
    exit 0
else
    echo "✓ OPENAI_API_KEY is set"
    echo "  (First 10 chars: ${OPENAI_API_KEY:0:10}...)"
fi

echo ""
echo "Testing AI availability in Python..."

uv run python -c "
from taskmaster.ai import AITaskSummarizer

summarizer = AITaskSummarizer()

if summarizer.is_available():
    print('✓ AI Summarizer is available!')
    print('✓ OpenAI client initialized')
    
    # Test actual summarization (optional)
    test_text = 'I need to prepare slides for my presentation, research the topic thoroughly, and practice my delivery at least three times before the meeting next Tuesday.'
    
    print('')
    print('Testing summarization...')
    print(f'Input: {test_text[:50]}...')
    
    try:
        result = summarizer.summarize(test_text)
        if result:
            print(f'✓ AI Output: \"{result}\"')
        else:
            print('⚠️  API call succeeded but returned no result')
    except Exception as e:
        print(f'⚠️  API call failed: {e}')
        print('   (This is normal if using a test/invalid key)')
else:
    print('⚠️  AI Summarizer is NOT available')
    print('   Possible reasons:')
    print('   - openai package not installed (try: uv sync)')
    print('   - API key format incorrect')
    print('')
"

echo ""
echo "========================================"
echo "Test Complete"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. If AI is available: Try 'uv run taskmaster' and use 'ai' command"
echo "2. If not: The app works fine without AI! Just core features only."
echo ""

