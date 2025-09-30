# NVAI Premium Multisig Creation Feature

## Overview

This feature allows NVAI token holders to create multisigs by burning NVAI tokens instead of paying SOL. An admin wallet pays the actual SOL fees, making this an exclusive perk for NVAI holders.

## ✅ What's Implemented

### 1. **Token Images**
- NVAI token displays your Nova logo
- SOL displays gradient Solana logo  
- Used throughout the app in token lists and payment UI

### 2. **NVAI Price Fetching**
- Fetches real-time NVAI/SOL price from Jupiter Quote API
- Fallback price: 1 NVAI = 0.000018 SOL (≈55,555 NVAI per SOL)
- Auto-calculates equivalent NVAI to burn

### 3. **Payment Method Selection**
New step in onboarding flow (Step 3 of 4):
```
Option 1: Pay with SOL (Standard)
Option 2: Burn NVAI (Premium) ⭐
```

### 4. **UI Components**
- `NVAIBurnOption.tsx` - Beautiful premium card with token images
- Shows user's NVAI balance
- Real-time validation (enough NVAI?)
- Smart error messages

### 5. **Backend API**
- `/api/admin-sign` - Secure server-side signing with admin wallet
- Keeps admin private key safe (never exposed client-side)

### 6. **UX Features**
- ✅ **Saved Recipients** - Stores last 10 addresses in localStorage
- ✅ **Auto-fill Your Wallet** - Pre-fills recipient with your address
- ✅ **MAX Button** - Smart max amount (keeps 0.001 SOL rent reserve)
- ✅ **Rent Protection** - Never drains vault completely
- ✅ **Token Images** - Nova logo for NVAI, gradient for SOL
- ✅ **Solscan Links** - All transactions link to Solscan
- ✅ **Reset Button** - Fix multisig address mismatch

## 🔧 Setup Required

### Step 1: Add Admin Wallet to .env.local

```bash
# Add this line to /Users/ceo/squads-v4-public-ui/.env.local
ADMIN_KEY=YourBase58EncodedPrivateKeyHere
```

**Important:**
- This wallet will PAY for multisig creation when users burn NVAI
- This wallet will NOT be added as a member (users keep full control)
- Keep this key SECURE - it's only used server-side in the API route

### Step 2: Fund the Admin Wallet

The admin wallet needs SOL to pay for multisig creations:
```
~0.01 SOL per multisig created
```

Recommended: Keep 1-5 SOL in the admin wallet for multiple creations.

### Step 3: Test the Flow

1. Restart dev server: `npm run dev:clean`
2. Connect with a wallet that has NVAI tokens
3. Start onboarding
4. On Step 3, you'll see:
   - "Pay with SOL" option
   - "Burn NVAI" option (premium)
5. Select NVAI if you have enough
6. Create multisig!

## 📊 How It Works

### Standard SOL Payment:
```
User Wallet → Pays 0.01 SOL → Multisig Created
           → User is member
```

### NVAI Burn Payment:
```
User Wallet → Burns ~555 NVAI → Multisig Created
Admin Wallet → Pays 0.01 SOL ↗ (Admin NOT a member)
```

## 🎨 UI Flow

```
Step 1: Welcome
Step 2: Add Members
Step 3: Choose Payment Method  ← NEW!
  ┌─────────────────────────────┐
  │ Pay with SOL                │
  │ Cost: ~0.01 SOL             │
  └─────────────────────────────┘
  
  ┌─────────────────────────────┐ ⭐ PREMIUM
  │ 🔥 Burn NVAI Tokens         │
  │ Cost: 555 NVAI              │
  │ Your balance: 1,200 NVAI ✓  │
  │ Admin pays SOL fees         │
  └─────────────────────────────┘

Step 4: Review & Create
```

## 💰 Current Pricing

Based on fallback (update when Jupiter API works):
- 1 NVAI = 0.000018 SOL
- 0.01 SOL = ~555 NVAI to burn
- Adjust in `lib/getNVAIPrice.ts` if needed

## 🚧 Current Status

### ✅ Completed:
- Payment method selection UI
- NVAI balance checking
- Price calculation
- Token images (Nova logo for NVAI)
- Admin signing API route
- Saved recipients & MAX button
- Rent protection
- All Solscan links

### 🔄 Pending (requires ADMIN_KEY):
- Actual NVAI burning transaction
- Admin wallet signing and fee payment
- Full end-to-end multisig creation with NVAI

### To Enable:
1. Add `ADMIN_KEY` to `.env.local`
2. Remove the "Coming soon" message in `MultisigOnboarding.tsx` line 165-175
3. Implement full NVAI burn + admin sign flow in `createMultisigWallet` function

## 🔐 Security Notes

- Admin private key stored in `.env.local` (server-side only)
- Never exposed to client
- API route `/api/admin-sign` handles signing
- Admin wallet is NOT added as multisig member
- Users maintain full control of their multisig

## 📝 NVAI Token Details

- **Mint Address:** `3SkFJRqMPTKZLqKK1MmY2mvAm711FGAtJ9ZbL6r1coin`
- **Decimals:** 6
- **Logo:** Uses Nova app logo (`/logo.png`)
- **Purpose:** Premium feature access, deflationary through burns

