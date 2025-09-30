# Quick Setup: Enable NVAI Premium Feature

## ✅ What's Already Done

All the code is implemented and working! You just need to add your admin wallet key.

## 🚀 Enable NVAI Payment in 3 Steps:

### Step 1: Add Admin Key to .env.local

```bash
# Open /Users/ceo/squads-v4-public-ui/.env.local
# Add this line (use your actual admin wallet private key in base58):

ADMIN_KEY=YourBase58PrivateKeyHere
```

**To get your admin key in base58 format:**
```bash
# If you have a Solana CLI keypair:
solana-keygen pubkey ~/.config/solana/admin-wallet.json

# To get the private key (be careful!):
# Use a script or wallet tool to export as base58
```

### Step 2: Remove "Coming Soon" Message

Open `components/MultisigOnboarding.tsx` and **delete lines 165-175**:
```typescript
// DELETE THIS BLOCK:
toast.error(
  <div className="flex flex-col gap-1">
    <span>⚠️ NVAI Payment Feature</span>
    <span className="text-xs">Coming soon! Please use SOL payment for now.</span>
    <span className="text-xs text-gray-400">The admin wallet setup is required first.</span>
  </div>,
  { id: "create-multisig", duration: 8000 }
);
setIsCreating(false);
return;
```

### Step 3: Restart Server

```bash
npm run dev:clean
```

## 🎉 Done!

Now when users create a multisig, they'll see:

```
Choose Payment Method
─────────────────────────────

[Pay with SOL]
Cost: ~0.01 SOL

[Burn NVAI] ⭐ PREMIUM
Cost: 555 NVAI (≈0.01 SOL)
Your balance: 1,200 NVAI ✓
Admin pays SOL fees!
```

## 🧪 Testing

1. Connect wallet with NVAI tokens
2. Start creating multisig
3. Choose "Burn NVAI" option
4. Complete flow
5. Check:
   - User's NVAI is burned
   - Admin wallet paid SOL fees
   - User IS a member
   - Admin is NOT a member

## ⚠️ Important Notes

- **ADMIN_KEY must be in .env.local** (server-side only, never exposed)
- **Admin wallet needs SOL** (~0.01 SOL per multisig creation)
- **NVAI mint:** `3SkFJRqMPTKZLqKK1MmY2mvAm711FGAtJ9ZbL6r1coin`
- **Fallback price:** 1 NVAI = 0.000018 SOL (update in `lib/getNVAIPrice.ts`)

## 🎨 Features Included

✅ Token images (NVAI = Nova logo, SOL = gradient)  
✅ Real-time balance checking  
✅ Price calculation from Jupiter  
✅ Saved recipients dropdown  
✅ Auto-fill your wallet  
✅ MAX button with rent protection  
✅ Solscan links on all transactions  
✅ Reset multisig button  
✅ Comprehensive logging  

## 📖 Full Documentation

See `NVAI_FEATURE.md` for complete technical details.

