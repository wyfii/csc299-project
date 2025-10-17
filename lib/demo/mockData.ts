// Mock data for demo mode - no real blockchain or API calls

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Mock wallet address
export const DEMO_WALLET_ADDRESS = "DemoWa11et1111111111111111111111111111111111";

// Mock multisig wallets
export const DEMO_MULTISIGS = [
  {
    address: "Demo5quad1111111111111111111111111111111111",
    name: "Company Treasury",
    members: [
      "DemoWa11et1111111111111111111111111111111111",
      "Member2222222222222222222222222222222222222",
      "Member3333333333333333333333333333333333333",
    ],
    threshold: 2,
    createdAt: new Date("2024-01-15"),
    balance: 125.45, // SOL
    isActive: true,
  },
  {
    address: "Demo5quad2222222222222222222222222222222222",
    name: "Marketing Fund",
    members: [
      "DemoWa11et1111111111111111111111111111111111",
      "Member4444444444444444444444444444444444444",
    ],
    threshold: 2,
    createdAt: new Date("2024-02-20"),
    balance: 87.32,
    isActive: true,
  },
  {
    address: "Demo5quad3333333333333333333333333333333333",
    name: "Investment Pool",
    members: [
      "DemoWa11et1111111111111111111111111111111111",
      "Member5555555555555555555555555555555555555",
      "Member6666666666666666666666666666666666666",
      "Member7777777777777777777777777777777777777",
    ],
    threshold: 3,
    createdAt: new Date("2024-03-10"),
    balance: 342.18,
    isActive: true,
  },
];

// Mock token holdings
export const DEMO_TOKENS = [
  {
    mint: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    balance: 125.45,
    usdValue: 18816.75,
    price: 150.0,
    decimals: 9,
    logo: "/sol-logo.png",
  },
  {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "USD Coin",
    balance: 5420.35,
    usdValue: 5420.35,
    price: 1.0,
    decimals: 6,
    logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  },
  {
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    symbol: "USDT",
    name: "Tether USD",
    balance: 2150.0,
    usdValue: 2150.0,
    price: 1.0,
    decimals: 6,
    logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png",
  },
];

// Mock transactions
export const DEMO_TRANSACTIONS = [
  {
    id: "tx1demo111111111111111111111111111111111111",
    multisigAddress: "Demo5quad1111111111111111111111111111111111",
    transactionIndex: 1,
    creator: "DemoWa11et1111111111111111111111111111111111",
    title: "Transfer to Marketing",
    status: "Approved",
    type: "Transfer",
    createdAt: new Date("2024-10-15T10:30:00"),
    approvals: [
      {
        member: "DemoWa11et1111111111111111111111111111111111",
        approved: true,
        timestamp: new Date("2024-10-15T10:31:00"),
      },
      {
        member: "Member2222222222222222222222222222222222222",
        approved: true,
        timestamp: new Date("2024-10-15T11:45:00"),
      },
    ],
    requiredApprovals: 2,
    details: {
      recipient: "Target8888888888888888888888888888888888888",
      amount: 10.5,
      token: "SOL",
    },
    executedAt: new Date("2024-10-15T11:46:00"),
    signature: "DemoSig1111111111111111111111111111111111111111111111111111111111111",
  },
  {
    id: "tx2demo222222222222222222222222222222222222",
    multisigAddress: "Demo5quad1111111111111111111111111111111111",
    transactionIndex: 2,
    creator: "Member2222222222222222222222222222222222222",
    title: "Pay Developer Salaries",
    status: "Pending",
    type: "Transfer",
    createdAt: new Date("2024-10-16T14:20:00"),
    approvals: [
      {
        member: "Member2222222222222222222222222222222222222",
        approved: true,
        timestamp: new Date("2024-10-16T14:20:00"),
      },
    ],
    requiredApprovals: 2,
    details: {
      recipient: "Dev99999999999999999999999999999999999999999",
      amount: 25.0,
      token: "SOL",
    },
  },
  {
    id: "tx3demo333333333333333333333333333333333333",
    multisigAddress: "Demo5quad1111111111111111111111111111111111",
    transactionIndex: 3,
    creator: "DemoWa11et1111111111111111111111111111111111",
    title: "Add New Team Member",
    status: "Pending",
    type: "Config Change",
    createdAt: new Date("2024-10-17T09:15:00"),
    approvals: [
      {
        member: "DemoWa11et1111111111111111111111111111111111",
        approved: true,
        timestamp: new Date("2024-10-17T09:15:00"),
      },
    ],
    requiredApprovals: 2,
    details: {
      action: "Add Member",
      newMember: "NewMem9999999999999999999999999999999999999",
    },
  },
  {
    id: "tx4demo444444444444444444444444444444444444",
    multisigAddress: "Demo5quad2222222222222222222222222222222222",
    transactionIndex: 1,
    creator: "DemoWa11et1111111111111111111111111111111111",
    title: "Purchase Ad Space",
    status: "Rejected",
    type: "Transfer",
    createdAt: new Date("2024-10-10T16:00:00"),
    approvals: [
      {
        member: "DemoWa11et1111111111111111111111111111111111",
        approved: true,
        timestamp: new Date("2024-10-10T16:00:00"),
      },
      {
        member: "Member4444444444444444444444444444444444444",
        approved: false,
        timestamp: new Date("2024-10-10T18:30:00"),
      },
    ],
    requiredApprovals: 2,
    details: {
      recipient: "AdProvider111111111111111111111111111111111",
      amount: 15.0,
      token: "SOL",
    },
  },
];

// Mock portfolio value over time (for charts)
export const DEMO_PORTFOLIO_HISTORY = [
  { date: "2024-07-01", value: 18500 },
  { date: "2024-07-15", value: 19200 },
  { date: "2024-08-01", value: 21000 },
  { date: "2024-08-15", value: 20500 },
  { date: "2024-09-01", value: 22800 },
  { date: "2024-09-15", value: 24100 },
  { date: "2024-10-01", value: 25200 },
  { date: "2024-10-17", value: 26387.1 }, // Current
];

// Mock member info
export const DEMO_MEMBERS: Record<string, { name: string; avatar: string | null; joinedAt: Date }> = {
  [DEMO_WALLET_ADDRESS]: {
    name: "You (Demo User)",
    avatar: null,
    joinedAt: new Date("2024-01-01"),
  },
  "Member2222222222222222222222222222222222222": {
    name: "Alice Johnson",
    avatar: null,
    joinedAt: new Date("2024-01-15"),
  },
  "Member3333333333333333333333333333333333333": {
    name: "Bob Smith",
    avatar: null,
    joinedAt: new Date("2024-01-15"),
  },
  "Member4444444444444444444444444444444444444": {
    name: "Carol White",
    avatar: null,
    joinedAt: new Date("2024-02-20"),
  },
  "Member5555555555555555555555555555555555555": {
    name: "David Lee",
    avatar: null,
    joinedAt: new Date("2024-03-10"),
  },
  "Member6666666666666666666666666666666666666": {
    name: "Emma Davis",
    avatar: null,
    joinedAt: new Date("2024-03-10"),
  },
  "Member7777777777777777777777777777777777777": {
    name: "Frank Miller",
    avatar: null,
    joinedAt: new Date("2024-03-10"),
  },
};

// Helper functions for demo mode
export const getDemoMultisigs = () => DEMO_MULTISIGS;

export const getDemoTransactions = (multisigAddress?: string) => {
  if (multisigAddress) {
    return DEMO_TRANSACTIONS.filter(tx => tx.multisigAddress === multisigAddress);
  }
  return DEMO_TRANSACTIONS;
};

export const getDemoTokens = () => DEMO_TOKENS;

export const getDemoPortfolioValue = () => {
  return DEMO_TOKENS.reduce((sum, token) => sum + token.usdValue, 0);
};

export const getDemoMemberName = (address: string) => {
  return DEMO_MEMBERS[address]?.name || `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const mockDelay = (ms: number = 800) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

