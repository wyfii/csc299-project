# Development Process Summary - CSC299 Final Project

**Student**: [Your Name]  
**Course**: CSC299  
**Date**: November 24, 2025

---

## What I Actually Built

I built a task manager 6 different times. Each version taught me something new about software development, and honestly, looking back at my first attempt is kind of embarrassing compared to what I can do now.

The journey went like this:
1. **Task 1** - Basic CLI that barely worked
2. **Task 2** - Way better, actually tested it this time
3. **Task 3** - Learned to package things properly
4. **Task 4** - Got AI working (kind of scary how easy it was)
5. **Task 5** - Tried the whole "spec before code" thing
6. **Final** - Combined everything into something I'm actually proud of

---

## How I Used AI Tools

I used pretty much every AI tool I could get my hands on. Here's what actually happened:

### Claude and ChatGPT

This is where I spent most of my time early on. I'd basically have conversations like "hey, how do I save tasks to a file?" and it would show me. Sometimes it worked great, sometimes it gave me overly complicated garbage that I had to simplify.

**What worked**: When I was stuck on something specific like date parsing or JSON serialization, asking Claude was way faster than Stack Overflow. It could explain the code too, which helped me actually learn instead of just copy-pasting.

**What didn't work**: In Task 1, I trusted an AI suggestion for ID generation that had a bug. Spent 2 hours debugging because I didn't understand the code I'd been given. Learned my lesson - always understand what you're committing.

### GitHub Copilot

This thing is addictive. Type half a function and it just... finishes it. Saved me probably 10 hours of typing.

**What worked**: Repetitive stuff like test cases. Write one test, Copilot writes 20 more following the pattern. Also great for docstrings - I'd write the function and it would suggest perfect documentation.

**What didn't work**: Sometimes it would autocomplete in completely wrong directions. Like suggesting `pip` commands when I was using `uv`, or suggesting old Python patterns when there were better ways.

### Cursor

Used this for the big refactor in Task 3. It could see my whole codebase and suggest how to reorganize things.

**What worked**: Converting Task 2's single file into Task 3's package structure. Cursor understood all the imports and dependencies.

**What didn't work**: It was slow. And sometimes it suggested changes that looked good but broke things.

### Claude Code

This was cool for Task 4. I described what I wanted - "integrate OpenAI to summarize task descriptions" - and it scaffolded the whole thing, including error handling I wouldn't have thought of.

**What worked**: Got Task 4 working in like 2 hours. It set up the API client, environment variable handling, all of it.

**What didn't work**: It made it too complex at first. Had retry logic and rate limiting that was overkill for a student project.

### GitHub Spec Kit (Task 5)

This was weird at first - writing a whole specification before any code felt backwards. But Task 5 ended up being the cleanest code I wrote.

**What worked**: Having everything planned out meant I knew exactly what to build. No feature creep, no confusion about requirements.

**What didn't worked**: Took forever to set up. Like an hour just writing specs before I could even start coding.

---

## What Each Task Actually Taught Me

### Task 1: "Make It Work"

Honestly just tried to get something running. Claude helped me understand JSON files and basic Python classes. The code was messy but it worked. No tests because I didn't know how yet.

**Big mistake**: Accepted AI code without understanding it. Had a bug that I couldn't fix because I didn't know what the code was doing.

### Task 2: "Make It Right"

This is where I learned testing. Wrote 24 test cases and suddenly my code got way better. Tests caught bugs before I even ran the app.

**Big win**: One test caught a status update bug that would have been a nightmare to debug in production.

Also added a bunch of features - due dates, tags, statistics. The AI helped but I was actually understanding what I was building this time.

### Task 3: "Make It Professional"

Learned about modern Python packaging. No more `python script.py`, now it's a proper package with `uv` and `pyproject.toml`.

This was hard. Packaging is confusing. But Cursor helped reorganize everything and now I actually understand how real Python projects work.

### Task 4: "Make It Smart"

Integrating the OpenAI API was easier than I expected and also kind of scary? Like I just write some Python and suddenly I have AI in my app.

**Important lesson**: Security matters. Almost hardcoded my API key. Good thing I asked and learned about environment variables.

### Task 5: "Make It Planned"

Used GitHub Spec Kit to write everything out before coding. Constitution, specifications, implementation plans. It felt slow but produced the best code.

**Realization**: Planning actually saves time. I didn't waste time on features that didn't fit or refactoring bad decisions.

### Final: "Make It Real"

This is where everything came together. I took the best parts of each task:
- Professional structure from Task 3
- Features from Task 2
- AI from Task 4
- Planning approach from Task 5

Plus I added the chat interface because the project spec said "prompt for a command, execute it, show results" - that's a REPL, not a CLI. So I built a real chat interface with colors and everything.

Broke the 600-line file into 7 focused modules. Added 39 tests. Made it actually look professional.

---

## What Actually Worked

**Testing First**: Every hour I spent writing tests saved me like 3 hours of debugging. Should have done this from Task 1.

**Multiple AI Tools**: Using different tools for different jobs was smart. Claude for learning, Copilot for speed, Cursor for refactoring.

**Iterating**: Building it 6 times wasn't wasted effort. Each version taught me something that made the next one better.

**Reading the Code**: When I stopped blindly trusting AI and actually read what it gave me, everything got better.

---

## What Didn't Work

**Trusting AI Blindly**: Task 1 had bugs because I didn't understand the code I committed. Never again.

**No Planning**: Task 1 and 2 were kind of chaotic. Task 5 showed me that planning first actually saves time.

**Over-Engineering**: AI loves to suggest enterprise patterns for simple problems. Had to learn to simplify.

**Inconsistent Style**: Each task looked different until I standardized everything in the final version.

---

## Real Talk About AI

AI didn't write this project for me. I wrote it with AI's help. Big difference.

What I learned:
- AI is really good at boilerplate and patterns
- AI is terrible at architecture decisions
- AI doesn't know what YOU specifically need
- AI suggestions need human review
- AI makes you faster only if you already understand what you're doing

The best code came from:
1. Me deciding what to build (human)
2. AI showing me how to implement it (AI)
3. Me understanding and adapting it (human)
4. Testing to make sure it works (human + AI suggestions)

---

## The Final Version

The `final/` directory is what I'm actually proud of. It has:

- **Chat interface** with colors (looks professional!)
- **7 clean modules** instead of one giant file
- **39 passing tests**
- **No hardcoded secrets** (learned that lesson)
- **Real error handling**
- **Actual documentation**

It's the kind of code I wouldn't be embarrassed to show in a job interview.

---

## What I'd Tell Other Students

1. **Use AI but understand everything** - If you can't explain the code, don't commit it
2. **Write tests early** - Seriously, it's worth it
3. **Iterate** - Your first version will be bad, that's fine
4. **Ask why** - Don't just accept AI suggestions, ask why it works
5. **Security matters** - Never hardcode keys, even in school projects
6. **Plan before coding** - Spec-driven was slower but produced better code

---

## Statistics

- **Time**: ~24 hours total
- **Code**: ~3,500 lines across all versions
- **Tests**: 90+ total
- **Git Commits**: 10+ showing progression
- **AI Sessions**: Too many to count
- **Bugs Fixed**: Way more than I want to admit
- **Things Learned**: Everything

---

## Conclusion

This project taught me way more than just how to build a task manager. I learned how to work with AI effectively, how to test code properly, how to structure a real project, and honestly how to be a better programmer.

The most important thing? AI is a powerful tool but it's still just a tool. I had to learn when to use it, when to ignore it, and when to do things myself.

Would I have learned this much building it once? No way. The iteration was the point. Each version built on the last, and the final version is something I actually made, not something AI generated for me.

---

**Word Count**: ~1,400 words (yeah, I went over the 500 minimum, but I had stuff to say)
