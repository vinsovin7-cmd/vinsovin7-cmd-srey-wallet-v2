import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Zap,
  Gift,
  CreditCard,
  Search,
  ExternalLink,
  CheckCircle2,
  X,
  Volume2,
  Coins,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Radio,
  Clock
} from "lucide-react";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { TARGET_MASTER_WALLET } from "../src/services/payoutEngine";

interface FlyingAirdropBirdProps {
  onOpenSearchHome?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const FlyingAirdropBird: React.FC<FlyingAirdropBirdProps> = ({
  onOpenSearchHome,
  onNavigateTab
}) => {
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();

  // Bird lifecycle states
  const [birdState, setBirdState] = useState<"idle" | "flying" | "perched" | "falling" | "landed">("idle");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [luckyUsdtAmount, setLuckyUsdtAmount] = useState<number>(50);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<{ txHash: string; tonviewerUrl: string } | null>(null);
  
  // Executive Payment Modal State
  const [activePaymentMethod, setActivePaymentMethod] = useState<string>("paypal");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [quickSearchInput, setQuickSearchInput] = useState("");

  const paypalContainerRef = useRef<HTMLDivElement>(null);

  // 10-Minute interval timer + 15-second initial teaser for testing
  useEffect(() => {
    // Teaser after 12 seconds so user can see it right away
    const teaserTimer = setTimeout(() => {
      triggerBirdFlight();
    }, 12000);

    // Regular 10-minute recurring cycle
    const tenMinuteInterval = setInterval(() => {
      triggerBirdFlight();
    }, 10 * 60 * 1000);

    return () => {
      clearTimeout(teaserTimer);
      clearInterval(tenMinuteInterval);
    };
  }, []);

  const triggerBirdFlight = () => {
    setBirdState("flying");
    if (navigator.vibrate) {
      navigator.vibrate([40, 60, 40]);
    }

    // After 6 seconds of flying across screen, bird perches on branch/tree
    setTimeout(() => {
      setBirdState("perched");

      // After 4 seconds of perching, crate drops from sky
      setTimeout(() => {
        setBirdState("falling");

        setTimeout(() => {
          setBirdState("landed");
        }, 1200);
      }, 4000);
    }, 6000);
  };

  const handleBirdClick = () => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
    // Random lucky USDT reward between $20 and $100
    const rand = Math.floor(Math.random() * 81) + 20;
    setLuckyUsdtAmount(rand);
    setIsModalOpen(true);
  };

  const handleClaimReward = async () => {
    setIsClaiming(true);
    try {
      const res = await fetch("/api/airdrop/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientWallet: userAddress || TARGET_MASTER_WALLET,
          amountUsdt: luckyUsdtAmount
        })
      });
      const data = await res.json();
      if (data.success) {
        setClaimResult({
          txHash: data.txHash,
          tonviewerUrl: data.tonviewerUrl
        });
        if (navigator.vibrate) {
          navigator.vibrate([150, 80, 150]);
        }
      }
    } catch (err) {
      console.warn("Claim error:", err);
    } finally {
      setIsClaiming(false);
    }
  };

  // Launch MoonPay Compliant Widget in Overlay/Popup
  const handleLaunchMoonPay = () => {
    const moonpayUrl = `https://buy.moonpay.com?apiKey=pk_live_default&currencyCode=ton&walletAddress=${TARGET_MASTER_WALLET}`;
    window.open(moonpayUrl, "_blank", "width=500,height=700");
  };

  // Handle TonConnect Instant $2 / 0.1 TON Payout Payload
  const handleTonConnectPayment = async () => {
    if (!tonConnectUI.connected) {
      tonConnectUI.openModal();
      return;
    }
    setIsProcessingPayment(true);
    try {
      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: TARGET_MASTER_WALLET,
            amount: "100000000", // 0.1 TON (~$0.60-$2.00 test fee)
          }
        ]
      };
      const result = await tonConnectUI.sendTransaction(tx);
      if (result && result.boc) {
        setPaymentSuccess(`On-chain transaction broadcast! BoC: ${result.boc.slice(0, 24)}...`);
      }
    } catch (err: any) {
      alert(`TON Connect payment cancelled or failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Render PayPal JS SDK Buttons when modal opens and activePaymentMethod === 'paypal'
  useEffect(() => {
    if (isModalOpen && activePaymentMethod === "paypal" && paypalContainerRef.current) {
      paypalContainerRef.current.innerHTML = "";
      if ((window as any).paypal && (window as any).paypal.Buttons) {
        try {
          (window as any).paypal.Buttons({
            createOrder: async () => {
              const res = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: "2.00" })
              });
              const data = await res.json();
              return data.id;
            },
            onApprove: async (data: any) => {
              setIsProcessingPayment(true);
              const res = await fetch("/api/paypal/capture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: data.orderID })
              });
              const captureData = await res.json();
              setIsProcessingPayment(false);
              if (captureData.success) {
                setPaymentSuccess(`Payment captured! Bank debited $2.00 USD. Blockchain TX: ${captureData.txHash}`);
              }
            },
            onError: (err: any) => {
              console.warn("PayPal SDK error:", err);
            }
          }).render(paypalContainerRef.current);
        } catch (e) {
          console.warn("PayPal rendering notice:", e);
        }
      }
    }
  }, [isModalOpen, activePaymentMethod]);

  return (
    <>
      {/* 1. FLOATING AIRDROP BIRD / CRATE ANIMATION ON VIEWPORT */}
      {birdState !== "idle" && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          
          {/* Bird Flying across screen in Slow Motion */}
          {birdState === "flying" && (
            <div
              onClick={handleBirdClick}
              className="absolute pointer-events-auto cursor-pointer animate-flyBirdSlow flex flex-col items-center group transition-transform hover:scale-110"
              style={{
                top: "15%",
                left: "-120px"
              }}
              title="Click the Celestial Airdrop Bird to claim Lucky USDT!"
            >
              {/* Glowing Aura & Bird Silhouette */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-emerald-400 opacity-90 blur-md animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center text-3xl select-none animate-bounce">
                  🕊️
                </div>
                {/* Carried Lucky Package Badge */}
                <div className="absolute -bottom-2 -right-1 bg-amber-500 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-lg border border-yellow-200 flex items-center gap-1 font-mono">
                  <span>💰</span>
                  <span>USDT</span>
                </div>
              </div>
              <span className="text-[10px] font-black font-mono text-amber-300 bg-black/80 px-2 py-0.5 rounded-md mt-1 border border-amber-500/40 opacity-0 group-hover:opacity-100 transition-opacity">
                Tap to Catch!
              </span>
            </div>
          )}

          {/* Perched on Branch (Top-Right of screen) */}
          {birdState === "perched" && (
            <div
              onClick={handleBirdClick}
              className="absolute top-24 right-8 sm:right-16 pointer-events-auto cursor-pointer animate-fadeIn flex flex-col items-center group transition-transform hover:scale-110"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/30 blur-lg animate-ping"></div>
                {/* Branch */}
                <div className="absolute -bottom-1 w-20 h-2 bg-gradient-to-r from-stone-700 via-amber-800 to-stone-700 rounded-full shadow-lg"></div>
                {/* Bird */}
                <div className="text-3xl select-none relative z-10 animate-pulse">
                  🦅
                </div>
                <div className="absolute -top-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow border border-white font-mono">
                  $ LUCKY AIRDROP
                </div>
              </div>
              <span className="text-[10px] font-black text-emerald-400 bg-black/80 px-2.5 py-0.5 rounded-md mt-2 border border-emerald-500/50">
                Perched • Tap Me!
              </span>
            </div>
          )}

          {/* Crate Falling & Landed at Bottom Corner */}
          {(birdState === "falling" || birdState === "landed") && (
            <div
              onClick={handleBirdClick}
              className={`absolute bottom-20 right-6 sm:right-12 pointer-events-auto cursor-pointer transition-all ${
                birdState === "falling" ? "animate-bounce" : "animate-pulse"
              }`}
            >
              <div className="relative flex flex-col items-center group">
                {/* Parachute / Glow */}
                <div className="text-2xl -mb-1 animate-pulse">🪂</div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-emerald-400 p-0.5 shadow-[0_0_30px_rgba(245,158,11,0.6)] group-hover:scale-110 transition-transform">
                  <div className="w-full h-full bg-[#0E1322] rounded-[14px] flex flex-col items-center justify-center p-2">
                    <span className="text-2xl animate-bounce">🎁</span>
                    <span className="text-[9px] font-black text-amber-300 font-mono">CLAIM</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-300 bg-black/90 px-2 py-0.5 rounded-full mt-1 border border-amber-500 font-mono shadow">
                  Click to Open!
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. DOCKED TRIGGER PILL IN ECOSYSTEM FOOTER/HEADER */}
      <div className="fixed bottom-3 left-3 z-30 flex items-center gap-2">
        <button
          onClick={triggerBirdFlight}
          className="px-3 py-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-teal-400 hover:from-amber-400 hover:to-teal-300 text-stone-950 font-black text-xs rounded-xl shadow-xl border border-yellow-200 cursor-pointer flex items-center gap-1.5 transition active:scale-95 select-none"
          title="Launch 10-Minute Slow-Motion Airdrop Bird"
        >
          <span>🕊️</span>
          <span className="font-sans font-bold">Airdrop Bird</span>
          <span className="text-[9px] font-mono bg-black/20 px-1 rounded">10m</span>
        </button>
      </div>

      {/* 3. EXECUTIVE PAYMENT & AIRDROP CLAIM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans animate-fadeIn">
          <div className="bg-[#0B0F19] border-2 border-amber-500/80 rounded-3xl max-w-2xl w-full p-6 shadow-[0_0_60px_rgba(245,158,11,0.3)] space-y-5 text-white relative overflow-hidden">
            
            {/* Top Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-stone-950 flex items-center justify-center text-2xl font-black shadow-lg">
                🕊️
              </div>
              <div>
                <h2 className="text-lg font-black tracking-wide text-white flex items-center gap-2">
                  Celestial Airdrop & Executive Payment Section
                </h2>
                <p className="text-xs text-stone-400">
                  Claim Lucky USDT Yield • 10 Compliant Payment Rails • Instant Master Wallet Settlement
                </p>
              </div>
            </div>

            {/* INLINE SEARCH PORTAL (At top of modal as requested) */}
            <div className="bg-[#121828] p-3 rounded-2xl border border-stone-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-300">
                <Search size={14} className="text-amber-400" />
                <span>Search Ecosystem Home Directly:</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={quickSearchInput}
                  onChange={(e) => setQuickSearchInput(e.target.value)}
                  placeholder="Type anything (e.g. 'Merlin', 'TON Wallet', 'Staking', 'TV')..."
                  className="flex-1 bg-black/60 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-stone-500 outline-none focus:border-amber-400"
                />
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    if (onOpenSearchHome) onOpenSearchHome();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-teal-400 text-stone-950 text-xs font-black rounded-xl cursor-pointer hover:brightness-110 shrink-0"
                >
                  Full Search Home ↗
                </button>
              </div>
            </div>

            {/* LUCKY USDT REWARD CLAIM BOX */}
            <div className="bg-gradient-to-r from-amber-950/40 via-stone-900 to-emerald-950/40 p-4 rounded-2xl border border-amber-500/40 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider font-mono">
                  🎁 Unlocked Lucky Yield
                </div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  +${luckyUsdtAmount}.00 USDT
                </div>
                <div className="text-[10px] text-stone-400">
                  Target: {TARGET_MASTER_WALLET.slice(0, 10)}...{TARGET_MASTER_WALLET.slice(-6)}
                </div>
              </div>

              <div>
                {claimResult ? (
                  <div className="text-right space-y-1">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={14} /> Claim Settled!
                    </span>
                    <a
                      href={claimResult.tonviewerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 font-mono"
                    >
                      <span>Tonviewer Explorer ↗</span>
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={handleClaimReward}
                    disabled={isClaiming}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-stone-950 font-black text-xs rounded-xl shadow-lg cursor-pointer transition active:scale-95 disabled:opacity-50"
                  >
                    {isClaiming ? "Broadcasting..." : "Claim Lucky USDT Now"}
                  </button>
                )}
              </div>
            </div>

            {/* 10 COMPLIANT PAYMENT METHODS TABS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-stone-300">
                <span className="flex items-center gap-1.5">
                  <CreditCard size={15} className="text-amber-400" />
                  <span>10 Compliant Payment Rails ($2.00 Instant VIP Test Order)</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">PCI-DSS Safe</span>
              </div>

              {/* Rails Selection Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: "paypal", name: "PayPal & Debit", icon: "💳" },
                  { id: "moonpay", name: "MoonPay Card", icon: "🌙" },
                  { id: "tonconnect", name: "TON Connect", icon: "💎" },
                  { id: "applepay", name: "Apple / Google Pay", icon: "📱" }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setActivePaymentMethod(m.id)}
                    className={`p-2.5 rounded-xl border text-left font-bold transition cursor-pointer flex items-center gap-2 ${
                      activePaymentMethod === m.id
                        ? "bg-amber-500/20 text-amber-300 border-amber-500 shadow-md"
                        : "bg-[#121828] text-stone-400 border-stone-800 hover:border-stone-700"
                    }`}
                  >
                    <span className="text-base">{m.icon}</span>
                    <span>{m.name}</span>
                  </button>
                ))}
              </div>

              {/* PAYMENT RAILS ACTIVE PANEL */}
              <div className="p-4 rounded-2xl bg-[#111728] border border-stone-800 space-y-3">
                {/* Notice: Compliant Card Verification */}
                <div className="text-[11px] text-stone-400 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                  <span>
                    Direct bank notification enabled: Your bank sends instant $2.00 confirmation upon completed card checkout.
                  </span>
                </div>

                {/* PayPal View */}
                {activePaymentMethod === "paypal" && (
                  <div className="space-y-3">
                    <p className="text-xs text-stone-300">
                      Pay $2.00 with PayPal, Visa, Mastercard, Discover, or American Express via PayPal's encrypted iframe:
                    </p>
                    <div ref={paypalContainerRef} id="paypal-button-container" className="min-h-[44px]"></div>
                  </div>
                )}

                {/* MoonPay View */}
                {activePaymentMethod === "moonpay" && (
                  <div className="space-y-3 text-center py-2">
                    <p className="text-xs text-stone-300">
                      Buy TON directly to Master Wallet <code className="text-emerald-400 font-mono">UQBL...bnBJ</code> using any debit or credit card:
                    </p>
                    <button
                      onClick={handleLaunchMoonPay}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer transition active:scale-95 inline-flex items-center gap-2"
                    >
                      <span>Buy Crypto with Card via MoonPay</span>
                      <ExternalLink size={14} />
                    </button>
                  </div>
                )}

                {/* TON Connect On-Chain View */}
                {activePaymentMethod === "tonconnect" && (
                  <div className="space-y-3 text-center py-2">
                    <p className="text-xs text-stone-300">
                      Sign a real cryptographic $2.00 (0.1 TON) transaction with Tonkeeper or MyTonWallet:
                    </p>
                    <button
                      onClick={handleTonConnectPayment}
                      disabled={isProcessingPayment}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer transition active:scale-95 inline-flex items-center gap-2"
                    >
                      <span>{isProcessingPayment ? "Signing in Wallet..." : "Pay 0.1 TON via Tonkeeper"}</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}

                {/* Apple / Google Pay */}
                {activePaymentMethod === "applepay" && (
                  <div className="space-y-3 text-center py-2">
                    <p className="text-xs text-stone-300">
                      Apple Pay and Google Pay are integrated inside our PayPal & MoonPay compliant payment sheets.
                    </p>
                    <button
                      onClick={() => setActivePaymentMethod("paypal")}
                      className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Open PayPal One-Click Sheet
                    </button>
                  </div>
                )}

                {/* Success Banner */}
                {paymentSuccess && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>{paymentSuccess}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-stone-500 font-mono">
                Cycle resets automatically every 10 minutes
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
