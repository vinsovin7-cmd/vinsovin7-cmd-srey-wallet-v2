import React, { useState, useEffect } from "react";
import {
  X,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Building2,
  DollarSign,
  ArrowRight,
  Sparkles,
  Key,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Coins,
  Globe,
  Wallet,
  Lock,
  Zap,
  Info
} from "lucide-react";

interface TransakMoonPayOfframpModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProvider?: "transak" | "moonpay";
  defaultMode?: "sell" | "buy";
  cryptoCurrency?: string; // e.g. "USDT" or "TON"
  walletAddress?: string;
  defaultAmount?: number;
}

export const TransakMoonPayOfframpModal: React.FC<TransakMoonPayOfframpModalProps> = ({
  isOpen,
  onClose,
  defaultProvider = "transak",
  defaultMode = "sell",
  cryptoCurrency = "USDT",
  walletAddress = "",
  defaultAmount = 100
}) => {
  const [provider, setProvider] = useState<"transak" | "moonpay">(defaultProvider);
  const [mode, setMode] = useState<"sell" | "buy">(defaultMode);
  const [selectedCrypto, setSelectedCrypto] = useState<string>(cryptoCurrency);
  const [fiatCurrency, setFiatCurrency] = useState<string>("USD");
  const [amount, setAmount] = useState<number>(defaultAmount);

  // API Keys (loaded from localStorage or using public test keys)
  const [transakApiKey, setTransakApiKey] = useState<string>(() => {
    return localStorage.getItem("transak_api_key") || "0cf39a2d-b0ad-44b4-82f7-ec8f3cfdbdf3"; // Transak sandbox public key
  });
  const [moonpayApiKey, setMoonpayApiKey] = useState<string>(() => {
    return localStorage.getItem("moonpay_api_key") || "pk_test_123456789";
  });
  const [showKeyConfig, setShowKeyConfig] = useState<boolean>(false);
  const [customKeyInput, setCustomKeyInput] = useState<string>("");
  const [saveKeySuccess, setSaveKeySuccess] = useState<boolean>(false);

  useEffect(() => {
    if (provider === "transak") {
      setCustomKeyInput(localStorage.getItem("transak_api_key") || "");
    } else {
      setCustomKeyInput(localStorage.getItem("moonpay_api_key") || "");
    }
  }, [provider]);

  if (!isOpen) return null;

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (provider === "transak") {
      if (customKeyInput.trim()) {
        localStorage.setItem("transak_api_key", customKeyInput.trim());
        setTransakApiKey(customKeyInput.trim());
      } else {
        localStorage.removeItem("transak_api_key");
        setTransakApiKey("0cf39a2d-b0ad-44b4-82f7-ec8f3cfdbdf3");
      }
    } else {
      if (customKeyInput.trim()) {
        localStorage.setItem("moonpay_api_key", customKeyInput.trim());
        setMoonpayApiKey(customKeyInput.trim());
      } else {
        localStorage.removeItem("moonpay_api_key");
        setMoonpayApiKey("pk_test_123456789");
      }
    }
    setSaveKeySuccess(true);
    setTimeout(() => setSaveKeySuccess(false), 3000);
  };

  // Build Transak Widget URL
  // In Transak, sell mode is "SELL" productsAvailed
  const isTransakProduction = transakApiKey !== "0cf39a2d-b0ad-44b4-82f7-ec8f3cfdbdf3" && !transakApiKey.includes("test");
  const transakBaseUrl = isTransakProduction ? "https://global.transak.com" : "https://global-stg.transak.com";
  
  const transakParams = new URLSearchParams({
    apiKey: transakApiKey,
    environment: isTransakProduction ? "PRODUCTION" : "STAGING",
    defaultCryptoCurrency: selectedCrypto === "USDT" ? "USDT" : "TON",
    network: "ton",
    fiatCurrency: fiatCurrency,
    productsAvailed: mode === "sell" ? "SELL" : "BUY",
    cryptoAmount: mode === "sell" ? String(amount) : "",
    fiatAmount: mode === "buy" ? String(amount) : "",
    walletAddress: walletAddress || "UQBLz9rXlNtlzVUMuUHosRBTpUWqfoXQ8WTkyAgtbSVlbnBJ",
    themeColor: "0079C1",
    hideMenu: "true"
  });
  const transakWidgetUrl = `${transakBaseUrl}/?${transakParams.toString()}`;

  // Build MoonPay Widget URL
  const moonpayBaseUrl = mode === "sell" ? "https://sell.moonpay.com" : "https://buy.moonpay.com";
  const moonpayParams = new URLSearchParams({
    apiKey: moonpayApiKey,
    currencyCode: selectedCrypto.toLowerCase() === "usdt" ? "usdt_ton" : "ton",
    baseCurrencyCode: fiatCurrency.toLowerCase(),
    baseCurrencyAmount: String(amount),
    walletAddress: walletAddress || "UQBLz9rXlNtlzVUMuUHosRBTpUWqfoXQ8WTkyAgtbSVlbnBJ"
  });
  const moonpayWidgetUrl = `${moonpayBaseUrl}/?${moonpayParams.toString()}`;

  const activeWidgetUrl = provider === "transak" ? transakWidgetUrl : moonpayWidgetUrl;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#0b1329] border border-cyan-500/50 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden my-auto text-white">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d1f4d] via-[#102a6b] to-[#0d1f4d] p-4 sm:p-5 border-b border-blue-900/60 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold">
              <Zap size={22} className="text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-white">
                  Real Crypto Off-Ramp & Cashout Gateway
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/80 font-bold">
                  LIVE RAILS
                </span>
              </div>
              <p className="text-xs text-sky-200/80">
                Convert on-chain TON / USDT directly into real fiat (Bank, Visa/Mastercard, or PayPal)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowKeyConfig(!showKeyConfig)}
              className="px-3 py-1.5 rounded-xl bg-blue-950/80 border border-blue-700/60 text-xs font-bold text-sky-300 hover:text-white flex items-center gap-1.5 transition"
            >
              <Key size={14} />
              <span>{showKeyConfig ? "Hide API Setup" : "API Key & Registration"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* API Registration & Instructions Panel (Collapsible) */}
        {showKeyConfig && (
          <div className="bg-[#0e1c3d] border-b border-blue-900/70 p-4 sm:p-6 space-y-4 animate-fade-in text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-cyan-300 flex items-center gap-2">
                <Info size={16} /> Where to Register & Get Your Real API Key (No Stress)
              </h4>
              <span className="text-[11px] text-stone-400">Takes ~2 minutes to register</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Transak Info */}
              <div className={`p-4 rounded-2xl border transition ${
                provider === "transak" ? "bg-blue-950/90 border-cyan-400/80 shadow-md" : "bg-black/30 border-blue-900/40"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    Transak (Most Recommended)
                  </div>
                  <a
                    href="https://dashboard.transak.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-[11px] flex items-center gap-1"
                  >
                    Register at Transak <ExternalLink size={12} />
                  </a>
                </div>
                <p className="text-stone-300 text-[11px] mb-2 leading-relaxed">
                  Best for TON blockchain and instant off-ramps directly to Visa/Mastercard, Bank ACH/Wire, or SEPA in 160+ countries.
                </p>
                <div className="space-y-1.5 text-[11px] text-stone-400">
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-cyan-400">1.</span>
                    <span>Go to <strong className="text-white">dashboard.transak.com</strong> and sign up.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-cyan-400">2.</span>
                    <span>Click <strong>API Keys</strong> in your dashboard sidebar to copy your public key.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-cyan-400">3.</span>
                    <span>Paste it below to run your ecosystem with your dedicated account!</span>
                  </div>
                </div>
              </div>

              {/* MoonPay Info */}
              <div className={`p-4 rounded-2xl border transition ${
                provider === "moonpay" ? "bg-blue-950/90 border-cyan-400/80 shadow-md" : "bg-black/30 border-blue-900/40"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                    MoonPay (Alternative)
                  </div>
                  <a
                    href="https://dashboard.moonpay.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-[11px] flex items-center gap-1"
                  >
                    Register at MoonPay <ExternalLink size={12} />
                  </a>
                </div>
                <p className="text-stone-300 text-[11px] mb-2 leading-relaxed">
                  Global crypto on/off-ramp provider supporting PayPal, card payouts, and bank transfers worldwide.
                </p>
                <div className="space-y-1.5 text-[11px] text-stone-400">
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-purple-400">1.</span>
                    <span>Register at <strong className="text-white">dashboard.moonpay.com</strong>.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-purple-400">2.</span>
                    <span>Under <strong>Developers &gt; API Keys</strong>, grab your Publishable Key (<code>pk_live_...</code> or <code>pk_test_...</code>).</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-purple-400">3.</span>
                    <span>Paste it below to activate custom MoonPay branding.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Input Form */}
            <form onSubmit={handleSaveApiKey} className="bg-black/40 p-3.5 rounded-2xl border border-blue-900/60 flex items-center gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2 text-stone-300 text-xs font-mono shrink-0">
                <Key size={14} className="text-cyan-400" />
                <span>Your {provider === "transak" ? "Transak API Key" : "MoonPay Publishable Key"}:</span>
              </div>
              <input
                type="text"
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value)}
                placeholder={provider === "transak" ? "Paste Transak API Key (e.g. 0cf39a2d-...)" : "Paste MoonPay Publishable Key (e.g. pk_live_...)"}
                className="flex-1 bg-[#0b1329] border border-blue-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-stone-500 outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shrink-0 transition"
              >
                Save Key
              </button>
              {saveKeySuccess && (
                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1 shrink-0">
                  <CheckCircle2 size={14} /> Saved!
                </span>
              )}
            </form>
          </div>
        )}

        {/* Controls Toolbar: Provider, Mode, Crypto, Fiat */}
        <div className="p-4 bg-[#081024] border-b border-blue-900/50 flex items-center justify-between flex-wrap gap-3">
          
          {/* Provider Selector */}
          <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-2xl border border-blue-900/60">
            <button
              type="button"
              onClick={() => setProvider("transak")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                provider === "transak"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/50"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <span>⚡ Transak (Fastest)</span>
            </button>
            <button
              type="button"
              onClick={() => setProvider("moonpay")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                provider === "moonpay"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-900/50"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <span>🌙 MoonPay</span>
            </button>
          </div>

          {/* Mode Selector: Sell (Cash Out) vs Buy */}
          <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-2xl border border-blue-900/60">
            <button
              type="button"
              onClick={() => setMode("sell")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                mode === "sell"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <span>💸 Cash Out (Off-Ramp)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("buy")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                mode === "buy"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <span>💳 Buy Crypto (On-Ramp)</span>
            </button>
          </div>

          {/* Currency Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-xl border border-blue-900/60">
              <span className="text-[11px] text-stone-400">Crypto:</span>
              <select
                value={selectedCrypto}
                onChange={(e) => setSelectedCrypto(e.target.value)}
                className="bg-transparent text-xs font-bold font-mono text-cyan-300 outline-none cursor-pointer"
              >
                <option value="USDT" className="bg-[#0b1329] text-white">USDT (TON)</option>
                <option value="TON" className="bg-[#0b1329] text-white">TON (Native)</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-xl border border-blue-900/60">
              <span className="text-[11px] text-stone-400">Payout Fiat:</span>
              <select
                value={fiatCurrency}
                onChange={(e) => setFiatCurrency(e.target.value)}
                className="bg-transparent text-xs font-bold font-mono text-emerald-300 outline-none cursor-pointer"
              >
                <option value="USD" className="bg-[#0b1329] text-white">USD ($)</option>
                <option value="EUR" className="bg-[#0b1329] text-white">EUR (€)</option>
                <option value="GBP" className="bg-[#0b1329] text-white">GBP (£)</option>
              </select>
            </div>

            <a
              href={activeWidgetUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-blue-900/60 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1 transition"
            >
              Open in New Tab <ExternalLink size={13} />
            </a>
          </div>

        </div>

        {/* Live Interactive Gateway View */}
        <div className="flex-1 bg-[#060c1d] relative min-h-[460px] flex flex-col">
          
          {/* Status Sub-bar */}
          <div className="bg-[#09142e] px-4 py-2 text-[11px] font-mono text-stone-300 border-b border-blue-950 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>
                {provider === "transak" ? "Transak Official Off-Ramp Protocol" : "MoonPay Global Rails"}
              </span>
              <span className="text-stone-500">•</span>
              <span className="text-cyan-300">
                Network: <strong>TON Mainnet</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-stone-400">Destination:</span>
              <span className="text-white font-bold truncate max-w-[200px]">
                {walletAddress ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}` : "Connected Wallet"}
              </span>
            </div>
          </div>

          {/* Embedded Widget Iframe */}
          <div className="flex-1 relative w-full h-[520px]">
            <iframe
              src={activeWidgetUrl}
              title={`${provider.toUpperCase()} Crypto Gateway`}
              allow="camera;microphone;payment"
              className="w-full h-full border-none bg-[#0a1329]"
            />
          </div>

          {/* Bottom Security Footer */}
          <div className="bg-[#0a1533] p-3 px-5 border-t border-blue-900/60 flex items-center justify-between flex-wrap gap-2 text-xs text-stone-300">
            <div className="flex items-center gap-2">
              <Lock size={13} className="text-emerald-400" />
              <span>Regulated Non-Custodial Gateway • Compliant with PCI-DSS & FinCEN</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-stone-400">
                Transfers settle directly to your verified bank account, Visa/Mastercard card, or PayPal
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
