# My CSC299 Project Experience

**Student**: Ayman Abdallah  
**Course**: CSC299  
**Date**: November 24, 2025

---

## What I Built

I built a task manager six times. Yeah, six different versions of basically the same thing. At first I was like "why are we doing this multiple times?" but honestly by the end I got it. Each version taught me something new, and looking back at my Task 1 code is actually painful lol.

---

## How I Used AI

I mainly used Claude Sonnet throughout the project, with ChatGPT sometimes when I needed a second opinion. No Copilot or anything fancy - just those two.

**What worked with Claude:**
- It was like having a TA available 24/7, which was amazing at 2am when I was stuck
- Great at explaining specific things like date parsing or JSON serialization
- Really good at catching bugs I'd been staring at for 20 minutes
- Helped me restructure Task 2's single file into Task 3's proper package structure

**What didn't work:**
- In Task 1, I trusted an AI suggestion for ID generation that had a bug. Spent 2 hours debugging code I didn't understand. Big lesson learned
- Claude gets repetitive and biased - keeps suggesting the same patterns instead of being creative
- Loves to over-engineer everything. For Task 4 it suggested retry logic and rate limiting for a school project. Had to tell it to chill

I also used GitHub Spec Kit for Task 5, which was weird at first - writing specs before code felt backwards. But the code came out way cleaner because I knew exactly what to build.

---

## The Journey

**Task 1** was rough. Just trying to get something running with Claude's help. No tests because I didn't know how yet. Made the mistake of using code I didn't understand.

**Task 2** is where things clicked. Learned pytest and wrote 24 tests. Tests caught bugs immediately, which was a game-changer. Added features like due dates and tags, and actually understood what I was building.

**Task 3** was about proper Python packaging with `uv` and `pyproject.toml`. Hard to learn but now I get how real Python projects work.

**Task 4** - integrating OpenAI API was scary easy. Almost hardcoded my API key (yikes) but learned about environment variables in time.

**Task 5** - used spec-driven development. Took forever to plan but the code practically wrote itself after.

**Final version** combined everything: professional structure, all the features, AI integration, and a chat interface with colors. Split 600 lines into 7 modules, wrote 39 tests, added proper error handling. It's code I could actually show someone.

---

## What I Learned

**What worked:**
- Writing tests early saves tons of debugging time
- Using AI for learning and debugging, but always understanding the code first
- Building it 6 times - each iteration made the next one better
- Actually reading and understanding AI suggestions instead of blindly copying

**What didn't work:**
- Trusting AI blindly - never again
- Not planning ahead - Task 5 showed me planning saves time overall
- Over-complicating things with enterprise patterns for simple problems

**Real talk on AI:**
AI didn't write this for me. I wrote it with AI's help. Big difference. AI is great at boilerplate and spotting bugs, but sucks at big decisions and gets biased. You have to understand everything before using it, and it only makes you faster if you already know what you're doing.

---

## Final Thoughts

This project taught me way more than just building a task manager. I learned how to work with AI effectively, write real tests, structure proper projects, and honestly just be better at programming.

The biggest thing? AI is a tool. A really smart tool, but still just a tool. I had to learn when to use it, when to ignore it, and when to figure things out myself.

Would I have learned this much building it once? No way. The iteration was the point - each version built on the last. The final version is something I actually made, not something AI generated.
