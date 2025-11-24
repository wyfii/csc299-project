# Security Guidelines for TaskMaster

## 🔐 API Key Management

### ✅ What We Do RIGHT

1. **Environment Variables** - API keys are read from environment, never hardcoded
2. **Graceful Fallback** - App works without API keys (AI features disabled)
3. **No Exposure** - Keys are never printed, logged, or displayed
4. **Git Ignored** - `.env` files are in `.gitignore`

### ❌ What We NEVER Do

1. ❌ Hardcode API keys in source code
2. ❌ Commit `.env` files to git
3. ❌ Print API keys to console
4. ❌ Include keys in error messages

## 🛡️ How to Set Your API Key

### Option 1: Environment Variable (Recommended)

```bash
# Set for current session
export OPENAI_API_KEY="sk-your-actual-key"

# Or add to your shell profile (~/.bashrc, ~/.zshrc)
echo 'export OPENAI_API_KEY="sk-your-actual-key"' >> ~/.zshrc
```

### Option 2: .env File (Local Development)

```bash
# Copy the example
cp .env.example .env

# Edit .env with your actual key
nano .env

# The .gitignore ensures this file is NEVER committed
```

### Option 3: No API Key (AI Features Disabled)

```bash
# Just run without setting the key
uv run taskmaster

# AI features will gracefully disable
# All other features work perfectly!
```

## 🔍 Verify Security

### Check for Hardcoded Keys

```bash
# This should return NOTHING from actual code files
grep -r "sk-proj" src/

# This should only show README examples
grep -r "sk-" .
```

### Check .gitignore

```bash
# Verify .env is ignored
git check-ignore .env
# Should output: .env

# Verify tasks.json is ignored (may contain personal data)
git check-ignore tasks.json
# Should output: tasks.json
```

### Check What's Being Committed

```bash
# Before committing, always check
git status

# Make sure you see:
# - NO .env files
# - NO API keys
# - NO tasks.json with personal data
```

## 🎓 Educational Note

This project demonstrates **production-grade security practices**:

1. **Separation of Secrets** - Code and secrets are separate
2. **Environment-Based Config** - Different keys for dev/prod
3. **Graceful Degradation** - Missing keys don't crash the app
4. **Secure Defaults** - App is secure by default

## 🚨 If You Accidentally Commit a Key

1. **Immediately rotate the key** at OpenAI
2. **Remove from git history** (use git filter-branch or BFG)
3. **Force push** to update remote
4. **Learn from it** - set up pre-commit hooks

## ✅ Security Checklist Before Submission

- [ ] No hardcoded API keys in any `.py` files
- [ ] `.env` is in `.gitignore`
- [ ] `tasks.json` is in `.gitignore`
- [ ] All secrets are environment-based
- [ ] README only has placeholder examples ("sk-your-key-here")
- [ ] No real keys visible in git history

## 📚 References

- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [12-Factor App Config](https://12factor.net/config)
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/safety-best-practices)

---

**Remember: If it's a secret, it stays out of git!** 🔒

