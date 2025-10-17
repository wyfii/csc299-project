"use client";
import { useEffect, useState } from 'react';
import { MockWalletProvider, useWallet } from '@/lib/demo/MockWalletProvider';
import { 
  getDemoMultisigs, 
  getDemoTransactions, 
  getDemoTokens, 
  getDemoPortfolioValue,
  getDemoMemberName,
  DEMO_WALLET_ADDRESS 
} from '@/lib/demo/mockData';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wallet, Users, TrendingUp, CheckCircle, Clock, XCircle, ArrowUpRight } from 'lucide-react';
import { getTokenImage } from '@/lib/getTokenImage';

function DemoContent() {
  const { publicKey, connected, connect, disconnect } = useWallet();
  const [multisigs, setMultisigs] = useState(getDemoMultisigs());
  const [selectedMultisig, setSelectedMultisig] = useState(multisigs[0]);
  const [transactions, setTransactions] = useState(getDemoTransactions(multisigs[0].address));
  const [tokens, setTokens] = useState(getDemoTokens());
  const [portfolioValue, setPortfolioValue] = useState(getDemoPortfolioValue());

  useEffect(() => {
    if (selectedMultisig) {
      setTransactions(getDemoTransactions(selectedMultisig.address));
    }
  }, [selectedMultisig]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'text-green-400';
      case 'Pending': return 'text-yellow-400';
      case 'Rejected': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="w-5 h-5" />;
      case 'Pending': return <Clock className="w-5 h-5" />;
      case 'Rejected': return <XCircle className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-black py-2 px-4 text-center font-bold">
        🎭 DEMO MODE - All data is simulated for presentation purposes
      </div>

      {/* Header */}
      <div className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-orange-500">NOVA VAULT</div>
              <div className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">DEMO</div>
            </div>
            
            {!connected ? (
              <Button 
                onClick={connect}
                className="bg-orange-500 hover:bg-orange-600 text-black font-bold"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Demo Wallet
              </Button>
            ) : (
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <div className="text-gray-400 text-xs">Connected</div>
                  <div className="font-mono text-orange-500">
                    {DEMO_WALLET_ADDRESS.slice(0, 6)}...{DEMO_WALLET_ADDRESS.slice(-4)}
                  </div>
                </div>
                <Button 
                  onClick={disconnect}
                  variant="outline"
                  className="border-gray-700"
                >
                  Disconnect
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {!connected ? (
        <div className="container mx-auto px-4 py-20 text-center">
          <Wallet className="w-20 h-20 text-gray-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Welcome to Nova Vault Demo</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Experience the power of multisig wallets with our interactive demo. 
            Click &ldquo;Connect Demo Wallet&rdquo; to explore all features with simulated data.
          </p>
          <Button 
            onClick={connect}
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-black font-bold"
          >
            <Wallet className="w-5 h-5 mr-2" />
            Connect Demo Wallet
          </Button>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gray-900 border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-400 text-sm">Total Portfolio Value</div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-green-400 text-sm mt-2">+12.5% this month</div>
            </Card>

            <Card className="bg-gray-900 border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-400 text-sm">Active Multisigs</div>
                <Users className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-3xl font-bold text-white">{multisigs.length}</div>
              <div className="text-gray-500 text-sm mt-2">{multisigs.reduce((sum, m) => sum + m.members.length, 0)} total members</div>
            </Card>

            <Card className="bg-gray-900 border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-400 text-sm">Pending Transactions</div>
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                {getDemoTransactions().filter(tx => tx.status === 'Pending').length}
              </div>
              <div className="text-gray-500 text-sm mt-2">Awaiting approval</div>
            </Card>
          </div>

          {/* Multisig Selector */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Your Multisigs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {multisigs.map((multisig) => (
                <Card 
                  key={multisig.address}
                  className={`p-6 cursor-pointer transition-all ${
                    selectedMultisig.address === multisig.address
                      ? 'bg-orange-500/20 border-orange-500'
                      : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                  }`}
                  onClick={() => setSelectedMultisig(multisig)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{multisig.name}</h3>
                      <div className="text-xs text-gray-500 font-mono mt-1">
                        {multisig.address.slice(0, 8)}...{multisig.address.slice(-6)}
                      </div>
                    </div>
                    <Users className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Balance</span>
                      <span className="font-bold">{multisig.balance} SOL</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Members</span>
                      <span>{multisig.members.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Threshold</span>
                      <span>{multisig.threshold}/{multisig.members.length}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Token Holdings */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Token Holdings - {selectedMultisig.name}</h2>
            <Card className="bg-gray-900 border-gray-800">
              <div className="divide-y divide-gray-800">
                {tokens.map((token) => (
                  <div key={token.mint} className="p-6 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12">
                        {getTokenImage(token.symbol, 48)}
                      </div>
                      <div>
                        <div className="font-bold">{token.symbol}</div>
                        <div className="text-sm text-gray-400">{token.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{token.balance.toLocaleString()} {token.symbol}</div>
                      <div className="text-sm text-gray-400">
                        ${token.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Transactions */}
          <div>
            <h2 className="text-xl font-bold mb-4">Recent Transactions - {selectedMultisig.name}</h2>
            <Card className="bg-gray-900 border-gray-800">
              <div className="divide-y divide-gray-800">
                {transactions.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    No transactions yet
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="p-6 hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg">{tx.title}</h3>
                            <span className={`flex items-center gap-1 text-sm ${getStatusColor(tx.status)}`}>
                              {getStatusIcon(tx.status)}
                              {tx.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400 space-y-1">
                            <div>Type: {tx.type}</div>
                            <div>Created by: {getDemoMemberName(tx.creator)}</div>
                            <div>Created: {tx.createdAt.toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          {tx.details.amount && (
                            <div className="text-xl font-bold text-orange-400">
                              {tx.details.amount} {tx.details.token}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            {tx.approvals.filter(a => a.approved).length}/{tx.requiredApprovals} approvals
                          </div>
                        </div>
                      </div>

                      {/* Approvals */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {tx.approvals.map((approval, idx) => (
                          <div 
                            key={idx}
                            className={`text-xs px-3 py-1 rounded ${
                              approval.approved 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {approval.approved ? '✓' : '✗'} {getDemoMemberName(approval.member)}
                          </div>
                        ))}
                      </div>

                      {tx.signature && (
                        <a 
                          href={`https://solscan.io/tx/${tx.signature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 mt-3"
                        >
                          View on Solscan <ArrowUpRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Demo Info Footer */}
          <div className="mt-12 text-center text-gray-500 text-sm">
            <p>🎭 This is a demo environment with simulated data</p>
            <p className="mt-2">All wallets, transactions, and balances are fake for demonstration purposes</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DemoPage() {
  return (
    <MockWalletProvider>
      <DemoContent />
    </MockWalletProvider>
  );
}

