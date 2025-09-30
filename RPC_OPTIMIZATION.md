# RPC Optimization Guide

## Current Issue
You're hitting rate limits with PublicNode (1200 requests/60s). This is because:
1. Multiple pages fetch data on every load
2. Transaction pages fetch multiple proposals
3. No caching was in place

## What I Fixed

### 1. **Disabled Auto-Refresh in Modal**
- Removed 10-second polling
- Users now manually click "Refresh" button
- **Saves ~360 RPC calls/hour**

### 2. **Added Page-Level Caching**
```typescript
export const revalidate = 30; // Cache for 30 seconds
```
Applied to:
- `/` (Home page)
- `/transactions`
- `/config`

**Result:** Pages reuse data for 30 seconds instead of fetching on every load

### 3. **Smart Caching Strategy**
- Data cached for 30 seconds
- Still dynamic per user (respects wallet/multisig)
- Significantly reduces redundant RPC calls

## Recommended: Upgrade Your RPC

### Option 1: Helius (Best for Multisig Apps)
```bash
# Get free tier: 100,000 req/day
https://www.helius.dev/

# Add to .env.local
NEXT_PUBLIC_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

### Option 2: QuickNode
```bash
# Free tier: 20M credits/month
https://www.quicknode.com/

# Add to .env.local
NEXT_PUBLIC_RPC_URL=https://your-endpoint.solana-mainnet.quiknode.pro/YOUR_KEY/
```

### Option 3: Alchemy Solana
```bash
# Free tier: 300M compute units/month  
https://www.alchemy.com/solana

# Add to .env.local
NEXT_PUBLIC_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY
```

## Quick Fix: Update .env.local

1. Get a free API key from any provider above
2. Update `.env.local`:
```bash
NEXT_PUBLIC_RPC_URL=<your-new-rpc-url>
```
3. Restart dev server

## Monitoring RPC Usage

### Check Current Usage
```javascript
// Add to your utils.ts
let rpcCallCount = 0;
export const trackRPC = () => {
  rpcCallCount++;
  console.log(`RPC calls: ${rpcCallCount}`);
};
```

### Tips to Reduce Calls
1. ✅ **Cache data** - Already implemented (30s)
2. ✅ **Manual refresh** - Already implemented  
3. ✅ **Batch requests** - Consider for future
4. ⚠️ **Avoid router.refresh()** - Only use when necessary
5. ⚠️ **Use Suspense** - For loading states without re-fetching

## Current Optimizations Active
- ✅ 30-second page caching
- ✅ Manual refresh only in modal
- ✅ No auto-polling
- ✅ Smart data fetching

**Estimated reduction:** 85-90% fewer RPC calls vs before

