# Debug Guide - "Only Seeing Background"

## Quick Checks:

### 1. Open Browser Console (F12 or Cmd+Option+I)

Look for these logs:
```
✅ Should see: "Found multisig for YOUR_WALLET: YOUR_MULTISIG"
✅ Should see: "Set wallet cookie: YOUR_WALLET_ADDRESS"
❌ If error: Check what it says
```

### 2. Check Your Wallet Connection

**Open the page: http://localhost:3000**

You should see ONE of these:

#### A) Landing Page (Not Connected)
- Animated background
- "Welcome to Nova" card
- "Connect Wallet" button
- **Action:** Click "Connect Wallet"

#### B) Onboarding Modal (New User)
- Full-screen modal
- "Create Your Multisig" steps
- **Action:** Complete onboarding

#### C) Main App (Existing User with Multisig)
- Sidebar with navigation
- "Overview" page with vault info
- Token balances
- **Action:** You're in! Navigate around

### 3. Common Issues:

#### Issue: Only see background, no card
**Fix:** Hard refresh browser
- Mac: `Cmd + Shift + R`
- Windows: `Ctrl + Shift + R`

#### Issue: Card shows but clicking does nothing
**Fix:** Check browser console for errors

#### Issue: Connected but shows empty state
**Fix:** Check if wallet cookie is set
```javascript
// In console:
document.cookie
// Should include: x-wallet=YOUR_ADDRESS
```

### 4. Force Clear Everything:

If still not working:
```bash
# Clear browser
- Open DevTools (F12)
- Application tab → Storage → Clear all
- Hard refresh (Cmd+Shift+R)

# Check cookies in console:
document.cookie

# Should show:
x-wallet=DnoUCUpKU7KPQ4cPYYFE8GjjqJuANxTEucXPKi4hUMh1
```

### 5. Verify Firestore:

The terminal shows:
```
Found multisig for DnoUCUpKU7KPQ4cPYYFE8GjjqJuANxTEucXPKi4hUMh1: HjZSoqv93Ww7hP7fd8sfNCjhpKKssS881t3AEJqn63Yx
```

This is GOOD! Your multisig is being found.

The issue is likely:
- Wallet not connected yet
- Browser cache showing old version
- Animation not completing

