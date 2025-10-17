# 🎭 Nova Vault Demo Mode

This demo version of Nova Vault allows you to showcase all features without any real blockchain connections, wallet setup, or API configuration.

## Features

✨ **No Real Wallet Needed**: Simulated wallet connection with mock address  
💰 **Fake Balances**: Pre-loaded with demo SOL, USDC, and USDT balances  
📊 **Sample Data**: Multiple multisig wallets with realistic transaction history  
🔐 **Full UI Experience**: All features visible and interactive  
⚡ **Instant Operations**: No waiting for blockchain confirmations  

## Quick Start

### Option 1: Visit Demo Page Directly

Simply navigate to `/demo` route when running the app:

```bash
# Start the app (use regular or dev mode)
npm run dev

# Then visit:
http://localhost:3000/demo
```

### Option 2: Run in Full Demo Mode

1. **Copy demo environment file**:
```bash
cp .env.demo .env.local
```

2. **Start the application**:
```bash
npm run dev
```

3. **Access the demo**:
```
http://localhost:3000/demo
```

## What's Included in Demo

### Mock Multisig Wallets
- **Company Treasury**: 3 members, 125.45 SOL
- **Marketing Fund**: 2 members, 87.32 SOL  
- **Investment Pool**: 4 members, 342.18 SOL

### Mock Transactions
- ✅ Approved transactions
- ⏳ Pending transactions awaiting signatures
- ❌ Rejected transactions
- Various transaction types (transfers, config changes)

### Mock Token Holdings
- **SOL**: 125.45 ($18,816.75)
- **USDC**: 5,420.35 ($5,420.35)
- **USDT**: 2,150.00 ($2,150.00)
- **Total Portfolio**: $26,387.10

### Mock Members
- Demo User (You)
- Alice Johnson
- Bob Smith
- Carol White
- David Lee
- Emma Davis
- Frank Miller

## Perfect For

- 📽️ **Presentations**: Show off features without setup hassle
- 🎓 **Training**: Let users explore without risk
- 🎨 **UI/UX Review**: Test design and flow
- 📱 **Screenshots/Videos**: Create marketing materials
- 👥 **Client Demos**: Quick feature walkthrough

## What Works

✅ Wallet connection/disconnection  
✅ Multisig selection  
✅ Portfolio overview  
✅ Token balances display  
✅ Transaction history  
✅ Member management view  
✅ Approval status tracking  
✅ Beautiful UI/UX showcase  

## What Doesn't Work (By Design)

❌ Real blockchain transactions  
❌ Actual wallet signing  
❌ API calls  
❌ Database writes  
❌ Real token transfers  
❌ Creating new multisigs (can add to mock data)  

## Customizing Demo Data

To customize the demo data, edit:

```
/lib/demo/mockData.ts
```

You can modify:
- Multisig wallets
- Token balances
- Transaction history
- Member names
- Portfolio values

## Demo Page URL

Once running, access the demo at:

```
http://localhost:3000/demo
```

The demo page includes:
- 🎭 Clear "DEMO MODE" banner at top
- 📊 Full portfolio dashboard
- 💼 Multiple multisig wallets
- 📝 Transaction history
- 🪙 Token holdings
- 👥 Member information

## Reverting to Production Mode

To switch back to production mode:

1. Remove or rename `.env.local`
2. Set up real environment variables from `example.env`
3. Configure actual RPC, Firebase, etc.

## Tips for Best Demo Experience

1. **Full Screen**: Present in fullscreen for best impact
2. **Prepared Story**: Have a narrative for the transactions
3. **Highlight Features**: Point out key security features
4. **Explain Benefits**: Connect features to real-world use cases
5. **No Delays**: Mock operations are instant - perfect for demos!

## Demo Script Suggestion

1. **Start**: "Let me show you how Nova Vault simplifies multisig management"
2. **Connect**: Click "Connect Demo Wallet"
3. **Overview**: "Here's our portfolio worth $26K+"
4. **Multisigs**: "We have 3 active multisig wallets for different purposes"
5. **Transactions**: "Some transactions are pending approval, others completed"
6. **Security**: "Notice how multiple members must approve each transaction"
7. **Easy**: "All on-chain, secure, and transparent"

## Support

This demo mode is perfect for:
- Class presentations ✅
- Investment pitches ✅
- Feature demonstrations ✅
- UI/UX testing ✅
- Marketing materials ✅

No wallet, no crypto, no setup - just pure demo goodness! 🚀

