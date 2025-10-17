# Nova Vault

Nova Vault is a React web application that provides a user-friendly interface for creating and managing multisig wallets on the Solana blockchain. The application interacts directly with on-chain Solana programs to enable secure, collaborative wallet management.

## What is Nova Vault?

Nova Vault is a decentralized application (dApp) built with React and Next.js that allows users to:

- **Create Multisig Wallets**: Set up shared wallets that require multiple signatures for transactions
- **Manage Members**: Add or remove wallet members with granular permissions
- **Execute Transactions**: Propose, approve, and execute transactions collaboratively
- **Monitor Assets**: View portfolio balances and transaction history
- **Secure Operations**: All operations happen on-chain through Solana smart contracts

## Why Multisigs Are Important

Multisignature wallets are crucial for:

### **Enhanced Security**
- **Eliminates Single Points of Failure**: No single person can access funds alone
- **Reduces Risk**: Even if one private key is compromised, funds remain secure
- **Shared Responsibility**: Multiple parties must approve transactions

### **Organizational Use Cases**
- **Team Treasuries**: DAOs, companies, and organizations can manage shared funds
- **Escrow Services**: Secure third-party transaction facilitation
- **Family Accounts**: Couples or families can manage joint finances
- **Investment Groups**: Multiple investors can collectively manage assets

### **Operational Benefits**
- **Transparent Governance**: All members can see proposed transactions
- **Approval Workflows**: Customizable thresholds for different transaction types
- **Audit Trail**: Complete on-chain history of all decisions and transactions
- **Decentralized Control**: No central authority can freeze or seize funds

## Technology Stack

Nova Vault is built using:

- **Frontend**: React 18 + Next.js 14 with TypeScript
- **Blockchain**: Solana Web3.js for on-chain interactions
- **Wallet Integration**: Solana Wallet Adapter for multiple wallet support
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React hooks and context
- **Database**: Firebase for metadata and user preferences

## Requirements

- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Node.js](https://nodejs.org/en/download) (v18 or later)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/) or npm

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd nova-vault
```

2. **Install dependencies**
```bash
yarn install
# or
npm install
```

3. **Environment Setup**
Copy `example.env` to `.env.local` and configure your environment variables:
```bash
cp example.env .env.local
```

4. **Build the application**
```bash
yarn build
# or
npm run build
```

## Development

Start the development server:

```bash
yarn dev
# or
npm run dev
```

The application will be available at `http://localhost:3000`

## Configuration

### Environment Variables

- **RPC URL**: Solana RPC endpoint for blockchain interactions
- **Firebase Config**: Database configuration for metadata storage
- **Analytics**: Optional analytics configuration

### Runtime Configuration

The application supports runtime configuration through cookies:

- **x-rpc-url**: Custom RPC endpoint
- **x-multisig**: Active multisig address
- **x-vault-index**: Selected vault index

## Key Features

### **Multisig Creation**
- Simple wizard-based setup process
- Configurable member permissions
- Flexible threshold requirements
- 0.1 SOL creation fee

### **Transaction Management**
- Propose any Solana transaction
- Multi-party approval process
- Real-time status updates
- Execution with required signatures

### **Asset Management**
- Portfolio overview with real-time balances
- Token transfer capabilities
- Transaction history and analytics
- Multiple asset type support

### **Security Features**
- Hardware wallet support
- Transaction simulation before signing
- Comprehensive permission system
- On-chain verification of all operations

## How It Works

1. **Wallet Connection**: Users connect their Solana wallet (Phantom, Solflare, etc.)
2. **Multisig Creation**: Set up a new multisig with designated members and approval thresholds
3. **Transaction Proposals**: Any member can propose transactions (transfers, smart contract interactions, etc.)
4. **Collaborative Approval**: Required number of members must approve before execution
5. **On-Chain Execution**: Approved transactions are executed directly on Solana

## Security Considerations

- **Non-Custodial**: Nova Vault never has access to your private keys
- **Open Source**: All code is available for audit and verification
- **On-Chain**: All critical operations happen on the blockchain
- **Wallet Integration**: Uses standard Solana wallet adapters for security

## Contributing

We welcome contributions! Please see our contributing guidelines for more information.

## License

This project is open source. See LICENSE file for details.

## Disclaimer

Use this software at your own risk. Nova Vault is provided "as is" without warranties of any kind. Users are responsible for:

- Securely managing their private keys
- Verifying transactions before signing
- Understanding the risks of blockchain interactions
- Complying with applicable laws and regulations

The maintainers of this repository are not responsible for any losses, damages, or issues that may occur from using this software.