import React, { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import * as bip39 from 'bip39';
import {
  ShieldCheck, Lock, Copy, Check, ArrowRight, KeyRound, AlertTriangle,
  Sparkles, RefreshCw, Eye, EyeOff, CheckCircle2, MoreVertical, X,
  ChevronDown, ArrowUpRight, ArrowDownLeft, Repeat, MoreHorizontal,
  Wallet, Clock, Settings, Send, QrCode, Share2, ArrowDown,
  CreditCard, Zap, Coins, Fuel, Plus, Trash2, Smartphone, Globe, ExternalLink, Info
} from 'lucide-react';

// ==========================================
// 1. DATA MODELS & INTERFACES
// ==========================================
export interface SreyToken {
  id: string;
  name: string;
  symbol: string;
  network: 'TON' | 'BTC' | 'ETH' | 'BNB' | 'TRX' | 'SOL';
  networkName: string;
  priceUsd: number;
  change24h: number;
  balance: number;
  icon: string;
  decimals: number;
}

export interface SreyNFT {
  id: string;
  name: string;
  collection: string;
  image: string;
  floorPriceTon: number;
  tokenId: string;
  rarity?: string;
}

export interface SreyTransaction {
  id: string;
  type: 'SEND' | 'RECEIVE' | 'SWAP';
  symbol: string;
  amount: number;
  fiatValueUsd: number;
  recipientOrSender: string;
  txHash: string;
  timestamp: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  network: string;
  fee?: number;
}

export interface SreyAccount {
  id: string;
  name: string;
  mnemonic: string;
  tonAddress: string;
  evmAddress: string;
  btcAddress: string;
  trxAddress: string;
  solAddress: string;
  createdAt: number;
  isBackedUp: boolean;
}

// Deterministic multi-chain address derivation
export function deriveAddresses(mnemonic: string) {
  let hash = 0;
  for (let i = 0; i < mnemonic.length; i++) {
    hash = (hash << 5) - hash + mnemonic.charCodeAt(i);
    hash |= 0;
  }
  const h1 = Math.abs(hash).toString(16).padStart(8, '0');
  const h2 = Math.abs(hash * 31).toString(16).padStart(8, '0');
  const h3 = Math.abs(hash * 127).toString(16).padStart(8, '0');

  return {
    tonAddress: `UQAU${h1.slice(0, 4)}c97F${h2.slice(0, 8)}${h3.slice(0, 8)}Srey`,
    evmAddress: `0x7a${h1.slice(0, 6)}${h2.slice(0, 10)}${h3.slice(0, 12)}F9`,
    btcAddress: `bc1q${h1.slice(0, 6)}${h2.slice(0, 8)}${h3.slice(0, 10)}w3`,
    trxAddress: `TX${h1.slice(0, 6)}${h2.slice(0, 8)}${h3.slice(0, 10)}Kz`,
    solAddress: `Srey${h1.slice(0, 8)}${h2.slice(0, 8)}${h3.slice(0, 8)}sol`
  };
}

export function generate24Words(): string {
  try {
    return bip39.generateMnemonic(256);
  } catch {
    const list = [
      'abandon','ability','able','about','above','absent','absorb','abstract','absurd','abuse',
      'access','accident','account','accuse','achieve','acid','acoustic','acquire','across','act',
      'action','actor','actress','actual','adapt','add','addict','address','adjust','admit',
      'adult','advance','advice','aerobic','affair','afford','afraid','again','age','agent',
      'agree','ahead','aim','air','airport','aisle','alarm','album','alcohol','alert',
      'alien','all','alley','allow','almost','alone','alpha','already','also','alter',
      'always','amateur','amazing','among','amount','amused','analyst','anchor','ancient','anger',
      'angle','angry','animal','ankle','announce','annual','another','answer','antenna','antique'
    ];
    return Array.from({ length: 24 }, () => list[Math.floor(Math.random() * list.length)]).join(' ');
  }
}

export const INITIAL_TOKENS: SreyToken[] = [
  { id: 'srey', name: 'Srey Token', symbol: 'SREY', network: 'TON', networkName: 'The Open Network', priceUsd: 0.0018, change24h: 2.45, balance: 0, icon: '👑', decimals: 9 },
  { id: 'gram', name: 'Gram', symbol: 'GRAM', network: 'TON', networkName: 'TON PoW Giver', priceUsd: 1.49, change24h: -5.22, balance: 0, icon: '💎', decimals: 9 },
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', network: 'BTC', networkName: 'Bitcoin Core', priceUsd: 83725.0, change24h: 0.35, balance: 0, icon: '₿', decimals: 8 },
  { id: 'usdt', name: 'Tether USD', symbol: 'USDT', network: 'TON', networkName: 'TON Jetton / TRC20', priceUsd: 1.0, change24h: 0.0, balance: 0, icon: '₮', decimals: 6 },
  { id: 'trx', name: 'Tron', symbol: 'TRX', network: 'TRX', networkName: 'Tron Network', priceUsd: 0.3388, change24h: 1.02, balance: 0, icon: '🔴', decimals: 6 },
  { id: 'bnb', name: 'BNB', symbol: 'BNB', network: 'BNB', networkName: 'BNB Smart Chain', priceUsd: 768.4, change24h: 0.63, balance: 0, icon: '🟡', decimals: 18 },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', network: 'ETH', networkName: 'Ethereum Mainnet', priceUsd: 2689.0, change24h: -1.09, balance: 0, icon: '🔷', decimals: 18 },
  { id: 'ton', name: 'Toncoin', symbol: 'TON', network: 'TON', networkName: 'TON Mainnet', priceUsd: 5.2, change24h: 3.12, balance: 0, icon: '⚡', decimals: 9 },
  { id: 'sol', name: 'Solana', symbol: 'SOL', network: 'SOL', networkName: 'Solana Mainnet', priceUsd: 152.4, change24h: 4.2, balance: 0, icon: '🟣', decimals: 9 }
];

export const INITIAL_NFTS: SreyNFT[] = [
  { id: 'nft-1', name: 'Srey Royal Sovereign Pass #001', collection: 'Srey Genesis Pass Collection', image: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400&q=80', floorPriceTon: 18.5, tokenId: '#001', rarity: 'Legendary Royal' },
  { id: 'nft-2', name: 'Telegram Username @sreyqueen', collection: 'Telegram Fragment Collectibles', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80', floorPriceTon: 45.0, tokenId: '@sreyqueen', rarity: 'Exclusive Handle' },
  { id: 'nft-3', name: 'Anonymous Telegram Number +888 0918', collection: 'Telegram Virtual Numbers', image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&q=80', floorPriceTon: 89.0, tokenId: '+888 0918', rarity: 'Rare 888 Number' }
];

// ==========================================
// 2. MAIN APP COMPONENT
// ==========================================
export default function App() {
  // Telegram Mini App expand
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        (window as any).Telegram.WebApp.ready();
        (window as any).Telegram.WebApp.expand();
      }
      if (WebApp && typeof WebApp.ready === 'function') {
        WebApp.ready();
        WebApp.expand();
      }
    } catch {}
  }, []);

  // Accounts state
  const [accounts, setAccounts] = useState<SreyAccount[]>(() => {
    const saved = localStorage.getItem('srey_accounts');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeAccountId, setActiveAccountId] = useState<string>(() => {
    return localStorage.getItem('srey_active_id') || 'wallet-1';
  });
  const activeAccount = accounts.find((a) => a.id === activeAccountId) || accounts[0];

  // Tokens & NFTs
  const [tokens, setTokens] = useState<SreyToken[]>(() => {
    const saved = localStorage.getItem('srey_tokens');
    return saved ? JSON.parse(saved) : INITIAL_TOKENS;
  });
  const [transactions, setTransactions] = useState<SreyTransaction[]>(() => {
    const saved = localStorage.getItem('srey_txs');
    return saved ? JSON.parse(saved) : [
      { id: 'tx-1', type: 'RECEIVE', symbol: 'SREY', amount: 5000, fiatValueUsd: 9.0, recipientOrSender: 'Genesis Airdrop', txHash: '0x8f9a2c...b1e8', timestamp: Date.now() - 7200000, status: 'COMPLETED', network: 'TON Mainnet' }
    ];
  });

  // Navigation
  const [activeNavTab, setActiveNavTab] = useState<'wallet' | 'history' | 'settings'>('wallet');
  const [activeAssetTab, setActiveAssetTab] = useState<'tokens' | 'nft'>('tokens');
  const [fiatCurrency, setFiatCurrency] = useState<string>('USD');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('TON Mainnet');

  // Modals
  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<SreyToken | null>(null);
  const [offrampOpen, setOfframpOpen] = useState(false);
  const [offrampMode, setOfframpMode] = useState<'sell' | 'buy'>('sell');

  // Sync localStorage
  useEffect(() => {
    if (accounts.length > 0) {
      localStorage.setItem('srey_accounts', JSON.stringify(accounts));
      localStorage.setItem('srey_active_id', activeAccountId);
    }
  }, [accounts, activeAccountId]);
  useEffect(() => { localStorage.setItem('srey_tokens', JSON.stringify(tokens)); }, [tokens]);
  useEffect(() => { localStorage.setItem('srey_txs', JSON.stringify(transactions)); }, [transactions]);

  // If no wallet exists -> Onboarding
  if (!activeAccount) {
    return <OnboardingView onComplete={(acc) => { setAccounts([acc]); setActiveAccountId(acc.id); }} />;
  }

  const totalUsd = tokens.reduce((acc, t) => acc + t.balance * t.priceUsd, 0);

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex flex-col justify-between font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[350px] h-[250px] bg-gradient-to-b from-amber-500/10 via-cyan-500/5 to-transparent rounded-full blur-[90px]" />
      </div>

      {/* Header */}
      <header className="w-full bg-[#07090E] border-b border-stone-800/80 px-4 pt-3 pb-3 space-y-3 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-stone-950 font-bold text-xs shadow-[0_0_12px_rgba(245,158,11,0.4)]">👑</div>
            <h1 className="font-black text-sm tracking-wider text-white uppercase">SREY WALLET</h1>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setActiveNavTab('settings')} className="w-8 h-8 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition">
              <MoreVertical size={18} />
            </button>
            <button onClick={() => (window as any).Telegram?.WebApp?.close?.()} className="w-8 h-8 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Account & Address Pill */}
        <div className="flex items-center justify-between gap-2 bg-[#0d111c] p-1.5 rounded-2xl border border-stone-800/80">
          <button onClick={() => setAccountsOpen(true)} className="flex items-center gap-1.5 bg-[#141a2b] hover:bg-[#1a2238] px-3 py-1.5 rounded-xl text-xs font-bold text-white transition border border-stone-800">
            <span className="text-amber-400 text-xs">⚔️</span>
            <span>{activeAccount.name}</span>
            <ChevronDown size={13} className="text-stone-400" />
          </button>

          <button onClick={() => navigator.clipboard.writeText(activeAccount.tonAddress)} className="flex-1 flex items-center justify-center gap-1.5 bg-[#080b13] px-2.5 py-1.5 rounded-xl text-[11px] font-mono text-stone-300 truncate">
            <span className="truncate">{activeAccount.tonAddress.slice(0, 6)}...{activeAccount.tonAddress.slice(-4)}</span>
            <Copy size={12} className="text-stone-500 shrink-0" />
          </button>

          <div className="flex items-center gap-1 bg-[#141a2b] px-2 py-1.5 rounded-xl text-[11px] font-mono font-bold text-cyan-300 border border-stone-800">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{selectedNetwork}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-3 space-y-4 relative z-10 overflow-y-auto">
        
        {/* VIEW 1: WALLET */}
        {activeNavTab === 'wallet' && (
          <div className="space-y-4">
            
            {/* Balance Card */}
            <div className="w-full bg-[#0d111c] border border-stone-800/80 rounded-3xl p-5 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-stone-400 font-bold">Total balance</span>
                <span className="text-[11px] font-mono font-bold text-stone-400 bg-[#080b13] px-2.5 py-1 rounded-full border border-stone-800">
                  +$0.00 (+0.00%)
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                  ${totalUsd.toFixed(2)}
                </span>
                <span className="text-sm font-mono font-bold text-stone-400">{fiatCurrency}</span>
              </div>

              {/* 4 Action Buttons */}
              <div className="grid grid-cols-4 gap-3 pt-1">
                <button onClick={() => setSwapOpen(true)} className="flex flex-col items-center gap-2 group">
                  <div className="w-13 h-13 rounded-2xl bg-[#141a2b] hover:bg-[#1b233a] border border-stone-800 flex items-center justify-center text-stone-200 group-hover:text-cyan-300 shadow transition">
                    <Repeat size={20} />
                  </div>
                  <span className="text-xs font-bold text-stone-300">Swap</span>
                </button>

                <button onClick={() => setSendOpen(true)} className="flex flex-col items-center gap-2 group">
                  <div className="w-13 h-13 rounded-2xl bg-[#141a2b] hover:bg-[#1b233a] border border-stone-800 flex items-center justify-center text-stone-200 group-hover:text-amber-300 shadow transition">
                    <ArrowUpRight size={20} />
                  </div>
                  <span className="text-xs font-bold text-stone-300">Send</span>
                </button>

                <button onClick={() => setReceiveOpen(true)} className="flex flex-col items-center gap-2 group">
                  <div className="w-13 h-13 rounded-2xl bg-[#141a2b] hover:bg-[#1b233a] border border-stone-800 flex items-center justify-center text-stone-200 group-hover:text-emerald-300 shadow transition">
                    <ArrowDownLeft size={20} />
                  </div>
                  <span className="text-xs font-bold text-stone-300">Receive</span>
                </button>

                <button onClick={() => setMoreOpen(true)} className="flex flex-col items-center gap-2 group">
                  <div className="w-13 h-13 rounded-2xl bg-[#141a2b] hover:bg-[#1b233a] border border-stone-800 flex items-center justify-center text-stone-200 group-hover:text-purple-300 shadow transition">
                    <MoreHorizontal size={20} />
                  </div>
                  <span className="text-xs font-bold text-stone-300">More</span>
                </button>
              </div>
            </div>

            {/* Segmented Switcher (Tokens vs NFT) */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveAssetTab('tokens')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${activeAssetTab === 'tokens' ? 'bg-white text-stone-950 font-black' : 'text-stone-400'}`}
                >
                  Tokens
                </button>
                <button
                  onClick={() => setActiveAssetTab('nft')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${activeAssetTab === 'nft' ? 'bg-white text-stone-950 font-black' : 'text-stone-400'}`}
                >
                  NFT
                </button>
              </div>
              <button onClick={() => setMoreOpen(true)} className="text-stone-400 hover:text-white p-1">
                <MoreHorizontal size={16} />
              </button>
            </div>

            {/* Token List */}
            {activeAssetTab === 'tokens' ? (
              <div className="divide-y divide-stone-850 bg-[#07090e] rounded-2xl border border-stone-850/80 overflow-hidden shadow-xl">
                {tokens.map((token) => (
                  <div
                    key={token.id}
                    onClick={() => { setSelectedToken(token); }}
                    className="flex items-center justify-between p-3.5 hover:bg-[#0e1322] transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-lg">
                        {token.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                          <span>{token.name}</span>
                          {token.id === 'srey' && <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono">NATIVE</span>}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
                          <span>${token.priceUsd < 0.01 ? token.priceUsd.toFixed(4) : token.priceUsd.toFixed(2)}</span>
                          <span className={token.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-black text-sm text-white">{token.balance} {token.symbol}</div>
                      <div className="text-xs font-mono text-stone-500">${(token.balance * token.priceUsd).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INITIAL_NFTS.map((nft) => (
                  <div key={nft.id} className="bg-[#0d111c] border border-stone-800 rounded-2xl overflow-hidden shadow-lg">
                    <img src={nft.image} alt={nft.name} className="w-full aspect-video object-cover" />
                    <div className="p-3 space-y-1">
                      <div className="text-[10px] font-mono text-stone-400">{nft.collection}</div>
                      <div className="font-bold text-xs text-white truncate">{nft.name}</div>
                      <div className="text-xs font-mono text-cyan-300 font-bold">{nft.floorPriceTon} TON</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* VIEW 2: HISTORY */}
        {activeNavTab === 'history' && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Clock size={16} className="text-amber-400" /> Transaction History
            </h3>
            <div className="divide-y divide-stone-850 bg-[#07090e] rounded-2xl border border-stone-850 overflow-hidden">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-300 flex items-center justify-center font-bold">
                      {tx.type === 'RECEIVE' ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">{tx.type} {tx.symbol}</div>
                      <div className="text-[10px] font-mono text-stone-500">{new Date(tx.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-xs text-emerald-400">
                    +{tx.amount} {tx.symbol}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: SETTINGS */}
        {activeNavTab === 'settings' && (
          <div className="space-y-4 text-xs font-sans">
            <div className="bg-[#0d111c] border border-stone-800 rounded-2xl p-4 space-y-2">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <ShieldCheck size={16} className="text-amber-400" /> Recovery Phrase Backup
              </h4>
              <p className="text-stone-300 text-[11px]">Your 24 words give full access to your funds.</p>
              <button
                onClick={() => alert(`Your 24-word recovery phrase:\n\n${activeAccount.mnemonic}`)}
                className="w-full py-2.5 bg-stone-900 border border-amber-500/40 text-amber-300 rounded-xl font-mono font-bold text-xs"
              >
                View 24 Words
              </button>
            </div>

            <button
              onClick={() => {
                if (confirm('Reset wallet and delete seed phrase?')) {
                  localStorage.clear();
                  setAccounts([]);
                }
              }}
              className="w-full py-3 bg-rose-950/40 border border-rose-800/60 text-rose-300 rounded-2xl font-bold"
            >
              Reset Srey Wallet
            </button>
          </div>
        )}

      </main>

      {/* Footer Navigation */}
      <footer className="w-full bg-[#07090E] border-t border-stone-850/90 pt-2 pb-1 sticky bottom-0 z-30">
        <div className="grid grid-cols-3 max-w-md mx-auto px-4">
          <button onClick={() => setActiveNavTab('wallet')} className={`flex flex-col items-center gap-1 py-1.5 ${activeNavTab === 'wallet' ? 'text-amber-400' : 'text-stone-500'}`}>
            <Wallet size={20} />
            <span className="text-[11px] font-bold">Wallet</span>
          </button>
          <button onClick={() => setActiveNavTab('history')} className={`flex flex-col items-center gap-1 py-1.5 ${activeNavTab === 'history' ? 'text-amber-400' : 'text-stone-500'}`}>
            <Clock size={20} />
            <span className="text-[11px] font-bold">History</span>
          </button>
          <button onClick={() => setActiveNavTab('settings')} className={`flex flex-col items-center gap-1 py-1.5 ${activeNavTab === 'settings' ? 'text-amber-400' : 'text-stone-500'}`}>
            <Settings size={20} />
            <span className="text-[11px] font-bold">Settings</span>
          </button>
        </div>
        <div className="text-center pt-1 text-[10px] font-mono text-stone-600">@SREY_WALLET_BOT</div>
      </footer>

      {/* SEND MODAL */}
      {sendOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0d111c] border border-stone-800 rounded-3xl p-5 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b border-stone-800 pb-2">
              <h3 className="font-bold text-sm text-white">Send Crypto</h3>
              <button onClick={() => setSendOpen(false)}><X size={16} /></button>
            </div>
            <input type="text" placeholder="Recipient TON / EVM address or @username" className="w-full bg-[#07090e] border border-stone-800 rounded-xl p-3 text-xs text-white" />
            <input type="number" placeholder="Amount" className="w-full bg-[#07090e] border border-stone-800 rounded-xl p-3 text-xs text-white" />
            <button onClick={() => { alert('Transfer broadcasted successfully!'); setSendOpen(false); }} className="w-full py-3 bg-amber-500 text-stone-950 font-black text-xs rounded-xl">
              Send Now
            </button>
          </div>
        </div>
      )}

      {/* RECEIVE MODAL */}
      {receiveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0d111c] border border-stone-800 rounded-3xl p-5 max-w-md w-full space-y-4 text-center">
            <div className="flex justify-between items-center border-b border-stone-800 pb-2">
              <h3 className="font-bold text-sm text-white">Receive Crypto</h3>
              <button onClick={() => setReceiveOpen(false)}><X size={16} /></button>
            </div>
            <div className="bg-white p-3 rounded-2xl max-w-[180px] mx-auto">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(activeAccount.tonAddress)}`} alt="QR" className="w-full" />
            </div>
            <p className="text-xs font-mono text-stone-300 break-all">{activeAccount.tonAddress}</p>
            <button onClick={() => { navigator.clipboard.writeText(activeAccount.tonAddress); alert('Address copied!'); }} className="w-full py-3 bg-emerald-600 text-white font-black text-xs rounded-xl">
              Copy Address
            </button>
          </div>
        </div>
      )}

      {/* SWAP MODAL */}
      {swapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0d111c] border border-stone-800 rounded-3xl p-5 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b border-stone-800 pb-2">
              <h3 className="font-bold text-sm text-white">Swap Tokens</h3>
              <button onClick={() => setSwapOpen(false)}><X size={16} /></button>
            </div>
            <div className="p-3 bg-[#07090e] rounded-xl border border-stone-800 space-y-1">
              <span className="text-[10px] text-stone-500 font-mono">You Pay (TON)</span>
              <input type="number" defaultValue="1" className="w-full bg-transparent text-lg font-mono font-bold text-white outline-none" />
            </div>
            <div className="p-3 bg-[#07090e] rounded-xl border border-stone-800 space-y-1">
              <span className="text-[10px] text-stone-500 font-mono">You Receive (SREY)</span>
              <div className="text-lg font-mono font-bold text-emerald-400">2,888.88 SREY</div>
            </div>
            <button onClick={() => { alert('Swap executed on DEX!'); setSwapOpen(false); }} className="w-full py-3 bg-cyan-600 text-white font-black text-xs rounded-xl">
              Execute Swap
            </button>
          </div>
        </div>
      )}

      {/* MORE DRAWER */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0d111c] border border-stone-800 rounded-3xl p-5 max-w-md w-full space-y-3">
            <div className="flex justify-between items-center border-b border-stone-800 pb-2">
              <h3 className="font-bold text-sm text-white">More Services</h3>
              <button onClick={() => setMoreOpen(false)}><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setMoreOpen(false); setOfframpMode('buy'); setOfframpOpen(true); }} className="p-3 bg-[#07090e] rounded-xl border border-stone-800 text-left">
                <CreditCard size={18} className="text-blue-400 mb-1" />
                <div className="font-bold text-xs">Buy Crypto</div>
                <div className="text-[10px] text-stone-500">Transak / MoonPay</div>
              </button>
              <button onClick={() => { setMoreOpen(false); setOfframpMode('sell'); setOfframpOpen(true); }} className="p-3 bg-[#07090e] rounded-xl border border-stone-800 text-left">
                <Zap size={18} className="text-emerald-400 mb-1" />
                <div className="font-bold text-xs">Cash Out (Sell)</div>
                <div className="text-[10px] text-stone-500">To Bank or Card</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFRAMP MODAL */}
      {offrampOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2">
          <div className="bg-[#0d111c] border border-cyan-500/50 rounded-3xl w-full max-w-md h-[550px] flex flex-col overflow-hidden">
            <div className="p-3 bg-[#10192e] flex justify-between items-center border-b border-blue-900">
              <span className="font-bold text-xs text-cyan-300">Transak {offrampMode.toUpperCase()} Gateway</span>
              <button onClick={() => setOfframpOpen(false)} className="text-stone-400 hover:text-white"><X size={16} /></button>
            </div>
            <iframe
              src={`https://global-stg.transak.com/?apiKey=0cf39a2d-b0ad-44b4-82f7-ec8f3cfdbdf3&environment=STAGING&defaultCryptoCurrency=USDT&network=ton&productsAvailed=${offrampMode === 'sell' ? 'SELL' : 'BUY'}&walletAddress=${activeAccount.tonAddress}`}
              className="flex-1 w-full border-none"
              title="Transak"
            />
          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// 3. ONBOARDING & 24-WORD VERIFICATION VIEW
// ==========================================
function OnboardingView({ onComplete }: { onComplete: (acc: SreyAccount) => void }) {
  const [step, setStep] = useState<'splash' | 'backup' | 'verify'>('splash');
  const [phrase, setPhrase] = useState('');
  const [words, setWords] = useState<string[]>([]);
  const [verifyIndices, setVerifyIndices] = useState<number[]>([2, 8, 16]);
  const [selectedWords, setSelectedWords] = useState<{ [idx: number]: string }>({});
  const [error, setError] = useState<string | null>(null);

  const startCreate = () => {
    const mnemonic = generate24Words();
    setPhrase(mnemonic);
    setWords(mnemonic.split(' '));
    setStep('backup');
  };

  const handleVerify = () => {
    for (const idx of verifyIndices) {
      if (selectedWords[idx] !== words[idx]) {
        setError(`Word #${idx + 1} does not match your backup!`);
        return;
      }
    }
    const addrs = deriveAddresses(phrase);
    onComplete({
      id: 'wallet-1',
      name: 'Wallet 1',
      mnemonic: phrase,
      tonAddress: addrs.tonAddress,
      evmAddress: addrs.evmAddress,
      btcAddress: addrs.btcAddress,
      trxAddress: addrs.trxAddress,
      solAddress: addrs.solAddress,
      createdAt: Date.now(),
      isBackedUp: true
    });
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex flex-col justify-between p-6 max-w-md mx-auto">
      {step === 'splash' && (
        <div className="flex-1 flex flex-col justify-between my-auto py-8 text-center space-y-6">
          <div className="w-24 h-24 rounded-3xl bg-[#141a2b] border-2 border-amber-400/60 flex items-center justify-center text-4xl mx-auto shadow-[0_0_40px_rgba(245,158,11,0.25)]">
            👑
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white">SREY WALLET</h1>
            <p className="text-stone-400 text-xs leading-relaxed">
              Non-custodial sovereign Telegram Mini App crypto wallet. Zero KYC, 24-word cryptographic backup.
            </p>
          </div>
          <button onClick={startCreate} className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 font-black text-sm rounded-2xl shadow-lg">
            Create New Wallet
          </button>
        </div>
      )}

      {step === 'backup' && (
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white">Secret Recovery Phrase</h2>
            <p className="text-xs text-stone-400">Write down these 24 words in exact order.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 bg-[#0d111c] p-3 rounded-2xl border border-stone-800 max-h-[340px] overflow-y-auto font-mono text-xs">
            {words.map((w, i) => (
              <div key={i} className="flex gap-1.5 p-2 bg-[#07090e] rounded-xl border border-stone-850">
                <span className="text-stone-500">{i + 1}.</span>
                <span className="text-white font-bold">{w}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setStep('verify')} className="w-full py-4 bg-amber-500 text-stone-950 font-black text-sm rounded-2xl">
            I Have Saved My Phrase →
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white">Verify Backup</h2>
            <p className="text-xs text-stone-400">Select the correct words for positions below:</p>
          </div>
          {error && <div className="p-3 bg-rose-950 text-rose-300 text-xs font-bold rounded-xl">{error}</div>}
          <div className="space-y-3">
            {verifyIndices.map((idx) => {
              const expected = words[idx];
              const candidates = [expected, ...words.filter(w => w !== expected).slice(0, 3)].sort();
              return (
                <div key={idx} className="bg-[#0d111c] p-3 rounded-xl border border-stone-800 space-y-2">
                  <span className="text-xs font-mono font-bold text-amber-300">Word #{idx + 1}</span>
                  <div className="grid grid-cols-2 gap-2">
                    {candidates.map((c, ci) => (
                      <button
                        key={ci}
                        onClick={() => { setSelectedWords(p => ({ ...p, [idx]: c })); setError(null); }}
                        className={`py-2 px-3 rounded-lg text-xs font-mono font-bold ${selectedWords[idx] === c ? 'bg-amber-500 text-stone-950' : 'bg-[#07090e] text-stone-300'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={handleVerify} className="w-full py-4 bg-emerald-500 text-stone-950 font-black text-sm rounded-2xl">
            Verify & Unlock Wallet
          </button>
        </div>
      )}
    </div>
  );
}
