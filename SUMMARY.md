# My CSC299 Project Experience

**Student**: yman  
**Course**: CSC299  
**Date**: November 24, 2025

---

## What This Project Actually Was

So I had to build a task manager. Six times. Yeah, you read that right - six different versions of basically the same thing. At first I was like "why are we doing this multiple times?" but honestly by the end I got it. Each version was pretty different and taught me something new.

Looking back at my Task 1 code is actually painful lol. Like what was I thinking with some of those variable names? But that's the point I guess - you have to start somewhere even if it sucks.

---

## How I Actually Used AI

Okay so full disclosure - I used Claude Sonnet for most of this. Sometimes I'd pull up ChatGPT if Claude wasn't helping or if I wanted to see if I'd get a different answer. That's it though, no Copilot or anything fancy.

### Claude Sonnet - My Main Tool

I basically had Claude open the entire time I was coding. It was like having a TA available 24/7 which was honestly amazing at 2am when I was stuck.

**When it was actually helpful:**

The thing that saved me the most was when I'd get stuck on something specific. Like "how do I parse dates in Python" or "why is my JSON not serializing" - Claude would just... explain it. And not in a Stack Overflow way where someone's condescending about it. It would show me code AND explain why it worked, which actually helped me learn instead of just copying.

It was also really good at catching bugs sometimes. Like I'd paste in my code and be like "this isn't working help" and it would spot the typo or logic error I'd been staring at for 20 minutes. Debugging is rough and having another set of eyes (even if they're AI eyes) helped a lot.

For Task 3, when I had to turn my mess of a single file into an actual Python package, Claude helped me figure out all the imports and structure. That would've taken me forever to figure out on my own.

**When it kinda sucked:**

Okay so in Task 1, I trusted Claude WAY too much. It suggested this ID generation thing and I was like "cool that looks smart" and just used it. Turns out it had a bug. I spent like 2 hours trying to fix it and I couldn't because I didn't even understand what the code was doing. That was a wake-up call - if you don't understand it, don't use it.

Also Claude gets really repetitive sometimes? Like it would keep suggesting the same pattern over and over instead of being creative. I guess that's the "biased" thing - it has its favorite ways of doing things and doesn't really think outside that box.

And oh my god the over-engineering. For Task 4 I asked it to help me add the OpenAI API and it came back with retry logic, rate limiting, custom exceptions, logging... like dude this is a school project not a startup. I had to tell it to chill and simplify.

### ChatGPT - The Backup

I'd use ChatGPT sometimes when I wanted a second opinion. Like if Claude gave me an answer that seemed weird, I'd ask ChatGPT the same question to see what it said.

Honestly though? I mostly stuck with Claude. ChatGPT was fine but switching between tools was annoying and Claude knew my code better since I'd been using it the whole time.

### GitHub Spec Kit (Task 5)

This was weird. You had to write all these specifications BEFORE writing any code. It felt backwards - like why am I writing 3 pages about what the code should do instead of just writing the code?

But then when I actually started coding Task 5, it was so much easier. I knew exactly what I needed to build, what the functions should do, what the tests should check. No confusion, no "wait what was I trying to do again?"

The downside was it took forever to set up. Like an hour of just writing specs before I could even open my code editor. But the code came out cleaner so maybe worth it?

---

## What I Learned From Each Task

### Task 1 - Just Make It Work

This was rough. First time doing a project like this and I basically just tried to get something running. Claude helped me understand JSON files and how Python classes work. The code was messy as hell but it... worked? Kinda?

I didn't write any tests because I didn't really know how to yet. Big mistake lol.

The worst part was when I blindly trusted AI code and it had a bug. Learned my lesson there - understand your code before you commit it.

### Task 2 - Actually Testing Stuff

This is where things clicked for me. I learned how to write tests (pytest is actually pretty cool) and wrote like 24 of them. Suddenly my code got SO much better because the tests would catch bugs immediately instead of me finding them later when running the app.

There was this one time where a test caught a bug with status updates that would've been a nightmare to debug later. That's when I realized testing isn't just busywork, it actually saves you time.

I also added a bunch of features - due dates, tags, some statistics stuff. AI helped but this time I was actually understanding what I was building instead of just copying.

### Task 3 - Making It Look Professional

This one was hard. Had to learn about Python packaging with `uv` and `pyproject.toml` and all that. Coming from just running `python script.py`, this felt really complicated.

But now I get it - this is how real Python projects work. The final version is a proper package you can install and run from anywhere. That's pretty cool.

Claude helped me reorganize everything from Task 2's giant single file into multiple modules. Learning about imports and package structure was confusing but useful.

### Task 4 - Adding AI (Inception?)

This one was trippy. I used AI to help me build an app that uses AI. Meta, right?

Honestly integrating the OpenAI API was way easier than I expected. Like scary easy - a few lines of Python and boom, your app can use GPT. 

The important thing I learned was about security. I almost hardcoded my API key directly in the code (yikes) but caught myself and learned about environment variables. Dodged a bullet there.

### Task 5 - Planning First

Used GitHub Spec Kit for this one - had to write a whole spec document before coding anything. Constitution, requirements, implementation plan, all of it.

It felt slow and I was itching to just start coding. But when I finally did start, the code practically wrote itself because I knew exactly what to build.

Planning first actually saves time in the long run. Who knew? (Everyone probably, but I had to learn it myself I guess)

### Final - Putting It All Together

This is the one I'm actually proud of. I took everything I learned:
- The professional structure from Task 3
- The features from Task 2  
- The AI integration from Task 4
- The planning approach from Task 5

Plus I added a chat interface with colors because the spec said to "prompt for a command, execute it, show results" and that sounded like a REPL to me, not just a basic CLI. So I went for it.

I split the giant 600-line file into 7 smaller modules that each do one thing. Wrote 39 tests. Added proper error handling. Actually documented stuff.

It's the kind of code I could show someone and not be embarrassed.

---

## What Actually Worked

**Writing tests**: Every hour writing tests saved me like 3 hours of debugging later. Should've started this in Task 1.

**Learning when to use AI**: Claude for learning new concepts and debugging. ChatGPT for second opinions. But always understanding the code before using it.

**Building it multiple times**: At first I thought doing 6 versions was overkill but each one taught me something that made the next one better. The iteration was the whole point.

**Actually reading the code**: When I stopped just copying AI suggestions and started reading and understanding them, everything improved.

---

## What Didn't Work

**Trusting AI too much**: Task 1 had bugs because I used code I didn't understand. Never doing that again.

**Not planning**: Task 1 and 2 were kind of chaotic. Just making it up as I went. Task 5 showed me that planning first is actually faster overall.

**Over-complicating things**: AI loves to suggest enterprise-level solutions for simple problems. Had to learn to push back and keep it simple.

**Inconsistent code style**: Each task looked different until the final version where I standardized everything. Should've thought about this earlier.

---

## Honest Thoughts on AI

Look, AI didn't write this project for me. I wrote it with AI helping. There's a big difference.

Here's what I figured out:
- AI is great at boilerplate code and common patterns
- AI sucks at big picture decisions and gets stuck in its preferred patterns (biased)
- AI doesn't know what YOU need - you have to tell it
- You HAVE to review everything AI gives you
- AI only makes you faster if you already kinda know what you're doing
- AI can spot bugs you miss, but you need to understand the fix

The best workflow was:
1. Me figuring out what to build
2. AI showing me how
3. Me actually understanding and adapting it
4. Testing to make sure it works (sometimes with AI's help on test ideas)

---

## The Final Version

The `final/` folder is what I'm turning in and what I'm actually proud of:

- Chat interface with colors (looks legit!)
- 7 clean modules instead of one mess of a file
- 39 passing tests
- No hardcoded API keys (learned that lesson)
- Actual error handling that makes sense
- Documentation that's actually useful

It's code I could show in a job interview and not die inside.

---

## If I Could Tell Other Students Anything

1. **Understand everything you commit** - If you can't explain the code to someone, don't use it
2. **Write tests early** - I'm serious, it saves so much time
3. **Your first version will suck** - That's totally fine and expected
4. **Ask AI why, not just how** - Understanding > copying
5. **Never hardcode secrets** - Even in school projects, build good habits
6. **Planning feels slow but isn't** - Spec-first took longer to start but finished faster

---

## By The Numbers

- **Time spent**: ~24 hours (probably more if I'm honest, but officially 24)
- **Lines of code**: ~3,500 across all versions
- **Tests written**: 90+
- **Git commits**: 10+
- **Times I talked to Claude**: Way too many to count
- **Bugs I had to fix**: More than I want to admit
- **Coffee consumed**: Too much

---

## Final Thoughts

This project taught me way more than just "how to build a task manager." I learned how to actually work with AI effectively, how to write real tests, how to structure a proper project, and honestly just how to be better at programming.

The biggest thing? AI is super useful but it's just a tool. Like a really smart tool, but still a tool. I had to learn when to use it, when to ignore it, and when to just figure things out myself.

Would I have learned this much if I'd only built it once? No way. The whole point was the iteration - building on what you learned before, making each version better. The final version is something I actually built, not something AI spit out.

And yeah, it took 6 tries to get here, but I think that's kinda the point of learning.

---

**Word Count**: ~1,800 words (I know the minimum was 500 but I had things to say)
