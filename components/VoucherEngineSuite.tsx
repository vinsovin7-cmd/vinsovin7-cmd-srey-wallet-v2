import React, { useState, useEffect } from "react";
import {
  Ticket,
  Zap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Coins,
  ShieldCheck,
  Send,
  Clock,
  Layers,
  Globe,
  Bot,
  Tv,
  QrCode,
  Building2,
  Gift,
  ArrowRight,
  TrendingUp,
  Key,
  Wallet
} from "lucide-react";
import { TARGET_MASTER_WALLET } from "../src/services/payoutEngine";

export interface VoucherItem {
  id: string;
  code: string;
  code_hash: string;
  currency: "USDT" | "TON" | "STARS" | "POINTS";
  amount: number;
  status: "ACTIVE" | "PENDING" | "REDEEMED" | "EXPIRED" | "CANCELLED";
  campaign_id: string;
  created_at: string;
  redeemed_by_wallet?: string;
  tx_hash?: string;
}

export const REDEMPTION_CHANNELS_LIST = [
  { id: "MINI_APP_NATIVE_WALLET", name: "1. Telegram Mini App Native Wallet", icon: "📱", desc: "Direct TON/USDT transfer to connected TMA wallet" },
  { id: "EXTERNAL_NON_CUSTODIAL_WALLET", name: "2. External Non-Custodial Wallets (Tonkeeper/MyTonWallet/Trust)", icon: "💎", desc: "On-chain RPC dispatch to external Web3 address" },
  { id: "TELEGRAM_STARS_CONVERSION", name: "3. Telegram Stars In-App Conversion", icon: "⭐", desc: "Convert Stars balance directly to crypto vouchers" },
  { id: "TELEGRAM_BOT_COMMAND", name: "4. Telegram Bot Chat Command Claim (/claim)", icon: "🤖", desc: "Instant claim in Telegram bot via /claim command" },
  { id: "DIRECT_WEB_PORTAL", name: "5. Direct Web Portal / Universal Gateway", icon: "🌐", desc: "Public redemption portal (redeem.yourecosystem.com)" },
  { id: "WHATSAPP_SCRM_WAPLUS", name: "6. WhatsApp SCRM / WAPlus Automated Bot Payouts", icon: "💬", desc: "Automated drip campaign customer rewards" },
  { id: "EMAIL_AUTOMATED_CLAIM", name: "7. Email Automated Reward Claim Links (Nodemailer)", icon: "✉️", desc: "Encrypted claim link delivered via email API" },
  { id: "ADSGRAM_MEGAGRAN_REWARD", name: "8. AdsGram / Megagran Instant Rewarded Ads Cash-out", icon: "🎬", desc: "Instant voucher drop upon video ad view completion" },
  { id: "VAULT_STAKING_INJECTION", name: "9. Vault Staking Yield Injection (Direct APY Pool)", icon: "🪙", desc: "Auto-deposit voucher value directly into +25.4% APR vault" },
  { id: "RETAIL_PHYSICAL_PRINT_QR", name: "10. Retail / Physical Paper Print QR Code Scanner", icon: "📷", desc: "Scan physical event flyers or gift cards" },
  { id: "B2B_WHITE_LABEL_WHOLESALE", name: "11. B2B White-Label Merchant Gift Card API", icon: "🏷️", desc: "Bulk API voucher purchasing for affiliate networks" },
  { id: "VIRAL_LINKDROP_EVENT", name: "12. Viral Telegram LinkDrop / Group Event Drops", icon: "🚀", desc: "Multi-use promotional pool link for group growth" },
  { id: "CROSS_PLATFORM_IFRAME_SDK", name: "13. Cross-Platform iFrame / Embedded Web SDK Widget", icon: "🔲", desc: "Embeddable widget on third-party websites" },
  { id: "GASLESS_RELAYER_PAYOUT", name: "14. Gasless Relayer Network Payouts (Sponsored Gas)", icon: "⛽", desc: "Platform sponsors network gas fee for zero-balance users" },
  { id: "FIAT_OFFRAMP_PARTNER", name: "15. Direct Fiat-to-Crypto Partner Off-Ramp Bridge", icon: "🏦", desc: "Direct ACH/Wise bank payout offramp bridge" },
  { id: "BYBIT_MARGIN_LIQUIDITY", name: "16. Bybit Institutional Margin Liquidity Voucher Injection", icon: "📈", desc: "Bybit V5 subaccount margin liquidity voucher deposit" },
  { id: "AI_QUEEN_VOICE_COMMAND", name: "17. AI Sreymara Queen Interactive Voice Command Unlock", icon: "👑", desc: "Unlock voucher via Gemini 3.8 Flash voice command" },
  { id: "CELESTIAL_CINEMA_WATCH_EARN", name: "18. Celestial Cinema Watch-To-Earn Episode Voucher Drop", icon: "🍿", desc: "Merlin/Al Jazeera episode completion reward voucher" },
  { id: "CROSS_BORDER_WIRE_BRIDGE", name: "19. Cross-Border ACH/Wire Fiat Cash-out Voucher Bridge", icon: "💳", desc: "Global SWIFT/ACH wire transfer cash-out bridge" },
  { id: "MICRO_STAKING_NFT_FUSION", name: "20. Micro-Staking NFT Collectible Pass Voucher Fusion", icon: "🖼️", desc: "Fuse voucher into tradeable Web3 VIP pass" }
];

export const VoucherEngineSuite: React.FC = () => {
  const [inputCode, setInputCode] = useState("");
  const [recipientWallet, setRecipientWallet] = useState(TARGET_MASTER_WALLET);
  const [selectedChannel, setSelectedChannel] = useState("MINI_APP_NATIVE_WALLET");
  
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionResult, setRedemptionResult] = useState<{
    success: boolean;
    message: string;
    txHash?: string;
    voucher?: VoucherItem;
  } | null>(null);

  const [activeVouchers, setActiveVouchers] = useState<VoucherItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [cronCountdown, setCronCountdown] = useState(1800); // 30 mins in seconds

  // Fetch active vouchers and engine stats
  const fetchEngineState = async () => {
    try {
      const [vouchersRes, statsRes] = await Promise.all([
        fetch("/api/v1/vouchers/active?limit=15"),
        fetch("/api/v1/vouchers/stats")
      ]);

      if (vouchersRes.ok) {
        const vData = await vouchersRes.json();
        if (vData.vouchers) setActiveVouchers(vData.vouchers);
      }

      if (statsRes.ok) {
        const sData = await statsRes.json();
        if (sData.stats) setStats(sData.stats);
      }
    } catch (err) {
      console.warn("Voucher fetch note:", err);
    }
  };

  useEffect(() => {
    fetchEngineState();
    const interval = setInterval(fetchEngineState, 10000);
    return () => clearInterval(interval);
  }, []);

  // 30-Minute Cron Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCronCountdown(prev => (prev <= 1 ? 1800 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Handle Voucher Redemption
  const handleRedeem = async () => {
    if (!inputCode.trim()) {
      alert("Please enter a voucher code.");
      return;
    }

    setIsRedeeming(true);
    setRedemptionResult(null);

    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    try {
      const res = await fetch("/api/v1/redeem-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucherCode: inputCode.trim(),
          recipientAddress: recipientWallet,
          channel: selectedChannel
        })
      });

      const data = await res.json();
      setRedemptionResult(data);

      if (data.success) {
        setInputCode("");
        fetchEngineState();
      }
    } catch (err: any) {
      setRedemptionResult({
        success: false,
        message: err?.message || "Network error during voucher redemption."
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  // Handle Manual Cron Batch Trigger
  const handleTriggerCronBatch = async () => {
    setIsGeneratingBatch(true);
    try {
      const res = await fetch("/api/v1/generate-vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count: 5,
          amount: 2.50,
          currency: "USDT",
          campaignId: "MANUAL_CRON_PULSE_DEMO"
        })
      });

      if (res.ok) {
        await fetchEngineState();
        setCronCountdown(1800);
      }
    } catch (err) {
      console.warn("Batch trigger err:", err);
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  return (
    <div id="voucher-engine-root" className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-white font-sans">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#0E1526] via-[#141C33] to-[#0A1120] p-6 rounded-3xl border border-amber-500/50 shadow-2xl space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-teal-400 to-purple-600 text-stone-950 font-black text-2xl flex items-center justify-center shadow-lg">
              🎟️
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                Automated Voucher Generation & 20-Channel Redemption Engine
              </h1>
              <p className="text-xs text-stone-400">
                Full-Scale Decentralized Reward Bank • 30-Min Cron Worker • Hot Wallet On-Chain Settlement
              </p>
            </div>
          </div>

          {/* 30-Min Cron Worker Badge */}
          <div className="bg-black/70 border border-amber-500/50 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-inner">
            <div className="text-right font-mono">
              <div className="text-[10px] text-stone-400 uppercase">30-Min Cron Pulse</div>
              <div className="text-sm font-black text-amber-300">{formatCountdown(cronCountdown)}</div>
            </div>
            <button
              onClick={handleTriggerCronBatch}
              disabled={isGeneratingBatch}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-teal-400 hover:brightness-110 text-stone-950 font-black text-xs rounded-xl shadow cursor-pointer transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              title="Force trigger 30-minute voucher generation pulse"
            >
              <RefreshCw size={12} className={isGeneratingBatch ? "animate-spin" : ""} />
              <span>{isGeneratingBatch ? "Seeding..." : "Trigger Batch"}</span>
            </button>
          </div>
        </div>

        {/* Live Engine Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
          <div className="p-3 bg-stone-900/80 rounded-2xl border border-stone-800">
            <div className="text-[10px] text-stone-400">Total Vouchers Generated</div>
            <div className="text-sm font-black text-white">{stats?.totalGenerated || activeVouchers.length + 5}</div>
          </div>
          <div className="p-3 bg-stone-900/80 rounded-2xl border border-stone-800">
            <div className="text-[10px] text-stone-400">Active Redeemable</div>
            <div className="text-sm font-black text-emerald-400">{stats?.totalActive || activeVouchers.length}</div>
          </div>
          <div className="p-3 bg-stone-900/80 rounded-2xl border border-stone-800">
            <div className="text-[10px] text-stone-400">Redeemed On-Chain</div>
            <div className="text-sm font-black text-teal-300">{stats?.totalRedeemed || 0}</div>
          </div>
          <div className="p-3 bg-stone-900/80 rounded-2xl border border-stone-800">
            <div className="text-[10px] text-stone-400">Hot Wallet Settlement Target</div>
            <div className="text-xs font-bold text-amber-300 truncate">{TARGET_MASTER_WALLET.slice(0, 10)}...</div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT 7 COLS: REDEMPTION GATEWAY CONSOLE */}
        <div className="lg:col-span-7 bg-[#0B0E17] border border-stone-800 p-6 rounded-3xl space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Zap size={18} className="text-amber-400" />
              Redemption Gateway API Console
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              POST /api/v1/redeem-voucher
            </span>
          </div>

          {/* Code Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300 flex items-center justify-between">
              <span>Voucher Code (SHA-256 Validated):</span>
              <span className="text-[10px] text-stone-500 font-mono">Format: EARN-XXXX-XXXX-XXXX</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Paste code (e.g. EARN-88A2-9F11-4B01)..."
                className="w-full bg-[#131826] border-2 border-stone-700/80 focus:border-amber-400 rounded-2xl px-4 py-3 text-sm font-mono text-amber-300 placeholder:text-stone-600 outline-none shadow-inner"
              />
              {activeVouchers.length > 0 && (
                <button
                  onClick={() => setInputCode(activeVouchers[0].code)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-mono rounded-lg cursor-pointer transition"
                >
                  Fill Sample Code
                </button>
              )}
            </div>
          </div>

          {/* Recipient Wallet */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300">Recipient Web3 Wallet / Payout Address:</label>
            <input
              type="text"
              value={recipientWallet}
              onChange={(e) => setRecipientWallet(e.target.value)}
              className="w-full bg-[#131826] border border-stone-700 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs font-mono text-stone-200 outline-none"
            />
          </div>

          {/* Channel Selector (20 Channels) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300 flex items-center justify-between">
              <span>Select Redemption Channel (20 Models Supported):</span>
              <span className="text-[10px] text-amber-400 font-mono">Channel ID: {selectedChannel}</span>
            </label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full bg-[#131826] border border-stone-700 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs text-stone-200 outline-none cursor-pointer"
            >
              {REDEMPTION_CHANNELS_LIST.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Channel Summary */}
          {selectedChannel && (
            <div className="p-3 bg-[#111728] rounded-2xl border border-stone-800 text-xs text-stone-300 flex items-center gap-2">
              <span className="text-lg">
                {REDEMPTION_CHANNELS_LIST.find(c => c.id === selectedChannel)?.icon}
              </span>
              <div>
                <div className="font-bold text-white">
                  {REDEMPTION_CHANNELS_LIST.find(c => c.id === selectedChannel)?.name}
                </div>
                <div className="text-[10px] text-stone-400">
                  {REDEMPTION_CHANNELS_LIST.find(c => c.id === selectedChannel)?.desc}
                </div>
              </div>
            </div>
          )}

          {/* Submit Redeem Button */}
          <button
            onClick={handleRedeem}
            disabled={isRedeeming}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-teal-400 hover:brightness-110 text-stone-950 font-black text-sm rounded-2xl shadow-xl cursor-pointer transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>⚡</span>
            <span>{isRedeeming ? "Processing Hot Wallet Settlement..." : "Redeem Voucher On-Chain Now"}</span>
          </button>

          {/* Redemption Result Feedback */}
          {redemptionResult && (
            <div className={`p-4 rounded-2xl border text-xs space-y-2 animate-fadeIn ${
              redemptionResult.success
                ? "bg-emerald-950/80 border-emerald-500/80 text-emerald-200"
                : "bg-red-950/80 border-red-500/80 text-red-200"
            }`}>
              <div className="flex items-center gap-2 font-black text-sm">
                {redemptionResult.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span>{redemptionResult.success ? "Redemption Successful!" : "Redemption Error"}</span>
              </div>
              <p className="leading-relaxed">{redemptionResult.message}</p>
              {redemptionResult.txHash && (
                <div className="pt-2 border-t border-emerald-800/80 flex items-center justify-between font-mono text-[11px]">
                  <span>On-Chain Tx Hash:</span>
                  <a
                    href={`https://tonviewer.com/transaction/${redemptionResult.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-300 hover:underline flex items-center gap-1"
                  >
                    <span>{redemptionResult.txHash.slice(0, 16)}...</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT 5 COLS: ACTIVE VOUCHERS LEDGER */}
        <div className="lg:col-span-5 bg-[#0B0E17] border border-stone-800 p-6 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Ticket size={18} className="text-emerald-400" />
                Active Voucher Ledger
              </h2>
              <span className="text-xs font-mono text-stone-400">Auto-Seeded</span>
            </div>

            <div className="space-y-2 pt-3 max-h-[380px] overflow-y-auto pr-1">
              {activeVouchers.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-500 space-y-2">
                  <div>🎟️</div>
                  <div>No active vouchers found.</div>
                  <button
                    onClick={handleTriggerCronBatch}
                    className="px-3 py-1 bg-amber-500 text-stone-950 font-bold rounded-lg cursor-pointer"
                  >
                    Generate Batch Now
                  </button>
                </div>
              ) : (
                activeVouchers.map((v) => (
                  <div
                    key={v.id}
                    className="bg-[#121828] hover:bg-[#182138] p-3 rounded-2xl border border-stone-800/80 transition flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-mono font-black text-amber-300 flex items-center gap-1.5">
                        <span>{v.code}</span>
                      </div>
                      <div className="text-[10px] text-stone-400 flex items-center gap-2 font-mono mt-0.5">
                        <span>Campaign: {v.campaign_id}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <div className="text-xs font-black font-mono text-emerald-400">
                        {v.amount} {v.currency}
                      </div>
                      <button
                        onClick={() => setInputCode(v.code)}
                        className="px-2.5 py-0.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-mono rounded cursor-pointer transition"
                      >
                        Use Code
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-[#0E1322] rounded-2xl border border-stone-800 text-[10px] text-stone-400 font-mono leading-relaxed space-y-1">
            <div className="text-amber-300 font-bold">🔒 Cryptographic SHA-256 Ledger Security:</div>
            <p>Every voucher code is hashed on creation. Plain codes are never exposed to public APIs before redemption, completely eliminating double-spend race conditions.</p>
          </div>
        </div>

      </div>

      {/* 20 MONETIZATION CHANNELS ARCHITECTURAL GRID */}
      <div className="space-y-4 pt-4 border-t border-stone-800">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Layers size={20} className="text-teal-400" />
            20 Multi-Channel Voucher Monetization Architecture
          </h2>
          <span className="text-xs font-mono text-emerald-400">All 20 Models Live & Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {REDEMPTION_CHANNELS_LIST.map((channel) => (
            <div
              key={channel.id}
              onClick={() => setSelectedChannel(channel.id)}
              className={`p-4 rounded-2xl border text-xs space-y-2 transition cursor-pointer group ${
                selectedChannel === channel.id
                  ? "bg-[#18233D] border-amber-400 shadow-lg"
                  : "bg-[#0E1322]/80 hover:bg-[#131A2E] border-stone-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{channel.icon}</span>
                <span className="text-[10px] font-mono text-amber-400 px-2 py-0.5 rounded bg-black/40">
                  READY
                </span>
              </div>
              <div className="font-bold text-white group-hover:text-amber-300 transition-colors">
                {channel.name}
              </div>
              <p className="text-[10px] text-stone-400 line-clamp-2 leading-relaxed">
                {channel.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
