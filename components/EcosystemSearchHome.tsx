import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Compass,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Zap,
  Globe,
  Terminal,
  Layers,
  Cpu,
  Tv,
  Wallet,
  ShieldCheck,
  Bot,
  Filter,
  Star,
  Activity,
  CheckCircle2,
  FolderGit2,
  Bookmark,
  Share2,
  X
} from "lucide-react";

interface EcosystemItem {
  id: string;
  name: string;
  category: "Apps" | "Builds" | "Sections" | "Wallets" | "Monetization" | "AI & Agents" | "Entertainment";
  letter: string;
  description: string;
  originTab: string;
  status: "ONLINE" | "ACTIVE" | "SYNCED" | "DEPLOYED";
  yieldUsdt?: number;
  tags: string[];
  icon: string;
}

const ECOSYSTEM_INDEX: EcosystemItem[] = [
  // A
  { id: "alphaqubit", name: "AlphaQubit Quantum Research & Live Ecosystem", category: "Builds", letter: "A", description: "Flagship quantum research ecosystem with Shopify, Tidio, and Telegram Webhooks.", originTab: "matrix", status: "ONLINE", yieldUsdt: 184590.50, tags: ["Quantum", "Shopify", "Tidio"], icon: "Cpu" },
  { id: "admin_palace", name: "Admin Control Palace", category: "Builds", letter: "A", description: "High-privilege master control room for platform security and treasury allocation.", originTab: "matrix", status: "ONLINE", yieldUsdt: 12500.00, tags: ["Admin", "Security"], icon: "ShieldCheck" },
  { id: "adsgram_payout", name: "Adsgram Ton Payout Suite", category: "Monetization", letter: "A", description: "High-CPM rewarded video ad monetization engine streaming USDT to Master Wallet.", originTab: "sco_monetization", status: "ONLINE", yieldUsdt: 4250.20, tags: ["Ads", "USDT"], icon: "Zap" },
  { id: "alive_queen", name: "Alive Sreymara Queen Avatar", category: "AI & Agents", letter: "A", description: "Real interactive digital human assistant powered by Gemini 3.6 Flash.", originTab: "github_app", status: "ONLINE", yieldUsdt: 1420.00, tags: ["AI", "Avatar"], icon: "Bot" },
  { id: "ai_shell", name: "AI Studio Shell & Control Plane", category: "Builds", letter: "A", description: "Google AI Studio unified engineering runtime and developer shell.", originTab: "matrix", status: "ONLINE", tags: ["Shell", "AI"], icon: "Terminal" },

  // B
  { id: "bybit_terminal", name: "Bybit Subaccount Terminal & Trading", category: "Wallets", letter: "B", description: "Live Bybit V5 subaccount equity tracker and micro-margin transfer engine.", originTab: "external_api", status: "SYNCED", yieldUsdt: 8920.40, tags: ["Trading", "Bybit"], icon: "Wallet" },
  { id: "bybit_auth", name: "Bybit Google Auth Modal", category: "Wallets", letter: "B", description: "OAuth & API credential binder for secure institutional subaccount connectivity.", originTab: "external_api", status: "SYNCED", tags: ["Auth", "Bybit"], icon: "ShieldCheck" },

  // C
  { id: "cline_agent", name: "Cline Agent Suite", category: "AI & Agents", letter: "C", description: "Autonomous multi-file coding agent and terminal orchestration suite.", originTab: "github_app", status: "ONLINE", tags: ["Agent", "Dev"], icon: "Cpu" },
  { id: "coinbase_mcp", name: "Coinbase Agent MCP Suite", category: "Wallets", letter: "C", description: "Model Context Protocol crypto wallet agent for automated asset routing.", originTab: "external_api", status: "ONLINE", yieldUsdt: 3410.00, tags: ["Crypto", "MCP"], icon: "Wallet" },
  { id: "community_hub", name: "Community Ecosystem Hub", category: "Apps", letter: "C", description: "Global social feed, user referral network, and community leaderboard.", originTab: "telegram", status: "ONLINE", tags: ["Community", "Social"], icon: "Globe" },
  { id: "cross_border", name: "Cross Border Payment Gateway Suite", category: "Monetization", letter: "C", description: "Global multi-currency fiat-to-crypto settlement pipeline.", originTab: "sco_monetization", status: "ONLINE", yieldUsdt: 15400.00, tags: ["Payments", "Global"], icon: "Zap" },
  { id: "cloudflare_dns", name: "Cloudflare Domain Manager", category: "Builds", letter: "C", description: "DNS zone record sync, SSL certificate provisioning, and security firewall.", originTab: "urls", status: "ONLINE", tags: ["DNS", "Security"], icon: "Globe" },
  { id: "coins_manager", name: "Coins & Credit Manager Modal", category: "Wallets", letter: "C", description: "Internal credit ledger, sticker shares, and micro-tip balance tracker.", originTab: "matrix", status: "ONLINE", yieldUsdt: 620.50, tags: ["Credits", "Wallet"], icon: "Wallet" },
  { id: "celestial_cinema", name: "Celestial Timeline Cinema", category: "Entertainment", letter: "C", description: "Immersive cosmic video playback timeline with synchronized ad banners.", originTab: "cinema", status: "ONLINE", yieldUsdt: 2950.00, tags: ["Video", "Cinema"], icon: "Tv" },

  // D
  { id: "dating_arts", name: "DatingArts Matchmaking Suite", category: "Apps", letter: "D", description: "AI-powered matchmaking, stealth yield generation, and romance profiles.", originTab: "matrix", status: "ONLINE", yieldUsdt: 5120.00, tags: ["Dating", "Yield"], icon: "Heart" },
  { id: "deep_intel", name: "Deep Intelligence Control Plane", category: "AI & Agents", letter: "D", description: "Autonomous neural reasoning engine and advanced task orchestrator.", originTab: "telemetry", status: "ONLINE", tags: ["AI", "Reasoning"], icon: "Cpu" },
  { id: "diagrams_suite", name: "Architecture Diagrams & Flowcharts", category: "Builds", letter: "D", description: "Visual ecosystem blueprint and system topology maps.", originTab: "cli", status: "ONLINE", tags: ["Diagrams", "Docs"], icon: "Layers" },

  // E
  { id: "eco_dashboard", name: "Ecosystem Dashboard", category: "Builds", letter: "E", description: "Central command dashboard for Shopify, Tidio signals, and revenue telemetry.", originTab: "matrix", status: "ONLINE", yieldUsdt: 48902.50, tags: ["Dashboard", "Core"], icon: "Globe" },
  { id: "eco_visitors", name: "Ecosystem Visitor Records Suite", category: "Apps", letter: "E", description: "Real-time visitor session tracker, geolocation logs, and conversion history.", originTab: "telemetry", status: "ONLINE", tags: ["Visitors", "Analytics"], icon: "Activity" },
  { id: "embedded_browser", name: "Ecosystem Embedded Browser", category: "Apps", letter: "E", description: "Secure sandboxed webview for launching external partner dApps.", originTab: "matrix", status: "ONLINE", tags: ["Browser", "Webview"], icon: "Globe" },
  { id: "embedded_views", name: "Embedded App Views & Mini DApps", category: "Apps", letter: "E", description: "Modular mini dApp container for 15+ integrated micro utilities.", originTab: "matrix", status: "ONLINE", tags: ["Apps", "Container"], icon: "Layers" },
  { id: "anti_malware", name: "Ecosystem Sentinel Anti-Malware Guardian", category: "Builds", letter: "E", description: "Active clipboard hijacker detector, address sanitizer, and threat blocker.", originTab: "matrix", status: "ONLINE", tags: ["Security", "Guard"], icon: "ShieldCheck" },
  { id: "express_vpn", name: "Express VPN Web Browser", category: "Apps", letter: "E", description: "Encrypted privacy proxy browser with region bypass capability.", originTab: "external_api", status: "ONLINE", tags: ["VPN", "Privacy"], icon: "Globe" },

  // F
  { id: "franz_messenger", name: "Franz Multi Messenger Wrapper", category: "Apps", letter: "F", description: "Aggregated chat workspace for Telegram, Discord, Slack, and WhatsApp.", originTab: "telegram", status: "ONLINE", tags: ["Chat", "Messenger"], icon: "MessageSquare" },
  { id: "franz_chatgpt", name: "Franz ChatGPT View", category: "AI & Agents", letter: "F", description: "Integrated OpenAI GPT-4 and Claude workspace assistant.", originTab: "github_app", status: "ONLINE", tags: ["AI", "Chat"], icon: "Bot" },
  { id: "franz_rewards", name: "Franz Rewards Center Modal", category: "Monetization", letter: "F", description: "Task-based reward center for daily messenger engagement.", originTab: "sco_monetization", status: "ONLINE", yieldUsdt: 840.00, tags: ["Rewards", "Ads"], icon: "Zap" },

  // G
  { id: "gemini_suite", name: "Google Gemini Ecosystem Suite", category: "AI & Agents", letter: "G", description: "Multi-model Gemini AI command center with vision and audio streaming.", originTab: "github_app", status: "ONLINE", tags: ["Google", "Gemini"], icon: "Sparkles" },
  { id: "google_executive", name: "Google Executive Account Suite", category: "Apps", letter: "G", description: "Enterprise Google Workspace integration and cloud console manager.", originTab: "external_api", status: "ONLINE", tags: ["Google", "Enterprise"], icon: "Globe" },
  { id: "geotargeting_ads", name: "GeoTargeting Social Monetization Suite", category: "Monetization", letter: "G", description: "Location-aware ad banner server optimized for high-CPM demographics.", originTab: "sco_monetization", status: "ONLINE", yieldUsdt: 6720.00, tags: ["Ads", "Geo"], icon: "Zap" },

  // I
  { id: "ime_rewards", name: "IMe Ai Rewards Suite", category: "Monetization", letter: "I", description: "AI-driven reward distribution engine for telegram channel activity.", originTab: "sco_monetization", status: "ONLINE", yieldUsdt: 2150.00, tags: ["Rewards", "AI"], icon: "Zap" },

  // L
  { id: "litmatch_landing", name: "Litmatch Landing Page", category: "Apps", letter: "L", description: "High-conversion viral social discovery landing page and soul match game.", originTab: "matrix", status: "ONLINE", tags: ["Landing", "Social"], icon: "Globe" },

  // M
  { id: "mail_studio", name: "Mail Studio Suite & Multi Sreymara AI", category: "AI & Agents", letter: "M", description: "Professional email composer, AI newsletter generator, and IMAP server proxy.", originTab: "github_app", status: "ONLINE", yieldUsdt: 4120.00, tags: ["Email", "AI"], icon: "Cpu" },
  { id: "mail_ads", name: "Mail.com Cinema Skyscraper Ads", category: "Monetization", letter: "M", description: "Embedded skyscraper video ad monetization units inside email client views.", originTab: "sco_monetization", status: "ONLINE", yieldUsdt: 1890.00, tags: ["Ads", "Email"], icon: "Tv" },
  { id: "master_cinema", name: "Master Cinema Player", category: "Entertainment", letter: "M", description: "Full-screen video streaming player with 80/20 creator revenue split.", originTab: "cinema", status: "ONLINE", yieldUsdt: 12450.00, tags: ["Video", "Cinema"], icon: "Tv" },
  { id: "mechat_bot", name: "MeChat Bot Suite", category: "AI & Agents", letter: "M", description: "Automated Telegram bot router for customer support and reward payouts.", originTab: "telegram", status: "ONLINE", tags: ["Bot", "Telegram"], icon: "Bot" },
  { id: "mini_cinema", name: "Portable Mini Cinema Ecosystem", category: "Entertainment", letter: "M", description: "Pocket video player with live ad countdowns and TON wallet balance sync.", originTab: "cinema", status: "ONLINE", yieldUsdt: 9840.00, tags: ["Cinema", "TON"], icon: "Tv" },

  // O
  { id: "onekey_app", name: "OneKey App & Hardware Sync", category: "Wallets", letter: "O", description: "Cold storage hardware wallet companion app and portfolio tracker.", originTab: "external_api", status: "SYNCED", yieldUsdt: 34500.00, tags: ["Wallet", "Hardware"], icon: "Wallet" },
  { id: "official_telegram", name: "Official Telegram Suite", category: "Apps", letter: "O", description: "Embedded Telegram mini app browser and chat channel manager.", originTab: "telegram", status: "ONLINE", tags: ["Telegram", "MiniApp"], icon: "MessageSquare" },

  // P
  { id: "phantom_wallet", name: "Phantom Solana Wallet & USDT Bridge", category: "Wallets", letter: "P", description: "Solana mainnet wallet integration with instant SPL USDT withdrawals.", originTab: "phantom", status: "ONLINE", yieldUsdt: 24500.00, tags: ["Solana", "USDT"], icon: "Wallet" },
  { id: "gemini_funds", name: "Gemini Funds Settlement Suite", category: "Monetization", letter: "P", description: "Automated 5-minute TON Mainnet revenue harvest and multi-relayer payout engine.", originTab: "matrix", status: "ONLINE", yieldUsdt: 179975.74, tags: ["TON", "Payouts"], icon: "Zap" },

  // Q
  { id: "quantum_scene", name: "Quantum Scene 3D Three.js Visualizer", category: "Entertainment", letter: "Q", description: "Interactive WebGL 3D quantum particle simulation and spatial audio.", originTab: "paradise", status: "ONLINE", tags: ["3D", "WebGL"], icon: "Cpu" },

  // S
  { id: "srey_wallet", name: "SreyWallet Non-Custodial TON Wallet", category: "Wallets", letter: "S", description: "Secure Telegram non-custodial wallet with multi-account support and swaps.", originTab: "ton_wallet", status: "ONLINE", yieldUsdt: 68400.00, tags: ["TON", "Wallet"], icon: "Wallet" },
  { id: "sreymara_installers", name: "Sreymara Appz Installer & APK Hub", category: "Builds", letter: "S", description: "Android APK builder, build-to-APK compiler, and download center.", originTab: "matrix", status: "ONLINE", tags: ["Android", "APK"], icon: "Cpu" },
  { id: "sreymara_ai", name: "Sreymara Queen Conversational AI", category: "AI & Agents", letter: "S", description: "Dedicated conversational AI persona with voice synthesis and intelligence chats.", originTab: "github_app", status: "ONLINE", yieldUsdt: 8900.00, tags: ["AI", "Chat"], icon: "Bot" },
  { id: "browser_workspace", name: "Sreymara Browser Workspace Suite", category: "Apps", letter: "S", description: "Multi-tab productivity workspace with integrated tools and dApps.", originTab: "matrix", status: "ONLINE", tags: ["Workspace", "Browser"], icon: "Globe" },
  { id: "sreymara_videogram", name: "Sreymara Videogram & Reels", category: "Entertainment", letter: "S", description: "Short-form video creator feed with automated tip monetization.", originTab: "matrix", status: "ONLINE", yieldUsdt: 4120.00, tags: ["Video", "Reels"], icon: "Tv" },
  { id: "sco_monetization", name: "Sco Monetization Suite", category: "Monetization", letter: "S", description: "Advanced CPM ad revenue optimizer and publisher dashboard.", originTab: "sco_monetization", status: "ONLINE", yieldUsdt: 31200.00, tags: ["Ads", "Revenue"], icon: "Zap" },
  { id: "solscan_suite", name: "Solscan Suite & Blockchain Explorer", category: "Builds", letter: "S", description: "Solana transaction inspector, account tracker, and gas fee estimator.", originTab: "solscan", status: "ONLINE", tags: ["Solana", "Explorer"], icon: "Globe" },
  { id: "share_to_earn", name: "Share to Earn USDT Suite", category: "Monetization", letter: "S", description: "Viral referral link generator with instant on-chain USDT rewards.", originTab: "sco_monetization", status: "ONLINE", yieldUsdt: 5400.00, tags: ["Referral", "USDT"], icon: "Zap" },

  // T
  { id: "telegram_wallet", name: "Telegram TON Wallet Mini App", category: "Wallets", letter: "T", description: "Native Telegram WebApp wallet interface for TonConnect and gasless TXs.", originTab: "telegram", status: "ONLINE", yieldUsdt: 124000.00, tags: ["Telegram", "TON"], icon: "Wallet" },
  { id: "music_hub", name: "Telegram Music Hub Suite", category: "Entertainment", letter: "T", description: "Decentralized audio streaming and artist royalty distribution hub.", originTab: "cinema", status: "ONLINE", yieldUsdt: 3890.00, tags: ["Music", "Audio"], icon: "Tv" },
  { id: "gmail_bot", name: "Telegram Gmail Bot View", category: "Apps", letter: "T", description: "Telegram bot interface for receiving and composing Gmail messages.", originTab: "telegram", status: "ONLINE", tags: ["Bot", "Gmail"], icon: "MessageSquare" },
  { id: "ton_settlement", name: "Ton Settlement Pipeline Suite", category: "Monetization", letter: "T", description: "Smart contract deployment and automated multi-sig distribution.", originTab: "matrix", status: "ONLINE", yieldUsdt: 45200.00, tags: ["TON", "SmartContract"], icon: "Zap" },
  { id: "transak_offramp", name: "Transak & MoonPay Offramp Modal", category: "Wallets", letter: "T", description: "Fiat credit card purchase and bank payout gateway widget.", originTab: "external_api", status: "ONLINE", tags: ["Fiat", "Offramp"], icon: "Wallet" },
  { id: "truth_finder", name: "Truth Finder Suite", category: "AI & Agents", letter: "T", description: "Fact-checking and autonomous data verification engine.", originTab: "telemetry", status: "ONLINE", tags: ["AI", "Search"], icon: "Cpu" },

  // V
  { id: "vercel_hub", name: "Vercel Deployment Hub", category: "Builds", letter: "V", description: "One-click production deployment, environment variables, and build logs.", originTab: "github_app", status: "ONLINE", tags: ["Deployment", "Cloud"], icon: "FolderGit2" },
  { id: "viral_modal", name: "Viral Guest Register Modal", category: "Apps", letter: "V", description: "Welcome registration modal with onboarding bonuses and airdrop claims.", originTab: "matrix", status: "ONLINE", tags: ["Onboarding", "Viral"], icon: "Star" },

  // W
  { id: "website_converter", name: "Website to App Converter & App Builder", category: "Builds", letter: "W", description: "Instant web-to-app generator with custom branding and APK packaging.", originTab: "matrix", status: "ONLINE", tags: ["Builder", "App"], icon: "Cpu" },
  { id: "youtube_cinema", name: "YouTube Cinema VideoSuite", category: "Entertainment", letter: "Y", description: "Curated YouTube video streams with synchronized monetization tickers.", originTab: "cinema", status: "ONLINE", yieldUsdt: 7420.00, tags: ["Video", "YouTube"], icon: "Tv" }
];

interface EcosystemSearchHomeProps {
  onNavigateTab: (tabName: string) => void;
  onClose?: () => void;
}

export const EcosystemSearchHome: React.FC<EcosystemSearchHomeProps> = ({ onNavigateTab, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [visitedHistory, setVisitedHistory] = useState<string[]>([]);

  const alphabet = ["ALL", ...Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ")];
  const categories = ["ALL", "Apps", "Builds", "Sections", "Wallets", "Monetization", "AI & Agents", "Entertainment"];

  // Track search & clicks in localStorage
  useEffect(() => {
    const history = localStorage.getItem("eco_search_history");
    if (history) {
      try {
        setVisitedHistory(JSON.parse(history));
      } catch {}
    }
  }, []);

  const recordVisit = (itemName: string) => {
    const updated = [itemName, ...visitedHistory.filter(i => i !== itemName)].slice(0, 10);
    setVisitedHistory(updated);
    localStorage.setItem("eco_search_history", JSON.stringify(updated));
  };

  const filteredItems = useMemo(() => {
    return ECOSYSTEM_INDEX.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesLetter = selectedLetter === "ALL" || item.letter === selectedLetter;
      const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;

      return matchesSearch && matchesLetter && matchesCategory;
    });
  }, [searchQuery, selectedLetter, selectedCategory]);

  return (
    <div className="fixed inset-0 z-50 bg-[#07090E]/95 backdrop-blur-xl flex flex-col text-white overflow-hidden animate-fadeIn font-sans">
      
      {/* HEADER BAR */}
      <div className="h-16 border-b border-stone-800 px-6 flex items-center justify-between bg-[#0B0E17]/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-purple-600 flex items-center justify-center font-black text-black text-lg shadow-[0_0_20px_rgba(0,255,163,0.3)]">
            🔍
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight flex items-center gap-2">
              Ecosystem Search Home <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">A-Z Index & Directory</span>
            </h1>
            <p className="text-xs text-stone-400">Search and jump to any app, build, wallet, or section instantly</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-emerald-400">Indexed Builds: {ECOSYSTEM_INDEX.length}</div>
            <div className="text-[10px] text-stone-500">Master Wallet Bound</div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
              title="Close Search Home"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* SEARCH & FILTER CONTROLS */}
      <div className="p-6 bg-gradient-to-b from-[#0D1220] to-[#090C14] border-b border-stone-800 space-y-4 shrink-0">
        
        {/* Main Search Bar */}
        <div className="relative max-w-3xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any home, build, app, or section... (e.g. 'A' for AlphaQubit, 'S' for SreyWallet, 'C' for Cinema)"
            className="w-full bg-[#131826] border border-stone-700/80 focus:border-emerald-500 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder:text-stone-500 outline-none shadow-2xl transition-all"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs bg-stone-800 hover:bg-stone-700 text-stone-300 px-2.5 py-1 rounded-lg cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* A-Z Alphabetical Quick Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-stone-800 max-w-5xl mx-auto">
          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer shrink-0 ${
                selectedLetter === letter
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-[0_0_12px_rgba(0,255,163,0.35)]"
                  : "bg-[#131826] text-stone-400 hover:text-white hover:bg-stone-800 border border-stone-800"
              }`}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Category Filter Badges */}
        <div className="flex items-center justify-center gap-2 flex-wrap max-w-4xl mx-auto">
          <span className="text-xs text-stone-500 font-bold mr-2 flex items-center gap-1">
            <Filter size={12} /> Categories:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                  : "bg-[#131826]/80 text-stone-400 hover:text-white hover:bg-stone-800 border border-stone-800/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* RESULTS GRID / LIST */}
      <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Recent / Clicked History Bar */}
        {visitedHistory.length > 0 && searchQuery === "" && selectedLetter === "ALL" && selectedCategory === "ALL" && (
          <div className="bg-[#111726]/60 border border-stone-800 p-4 rounded-2xl space-y-2">
            <div className="text-xs font-bold text-stone-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Compass size={14} className="text-emerald-400" /> Recently Jumped Origins
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {visitedHistory.map((histName, idx) => {
                const found = ECOSYSTEM_INDEX.find(i => i.name === histName);
                if (!found) return null;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      recordVisit(found.name);
                      onNavigateTab(found.originTab);
                      if (onClose) onClose();
                    }}
                    className="bg-[#182033] hover:bg-[#202b44] border border-stone-700/60 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer group"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform" />
                    {found.name}
                    <ArrowRight size={12} className="text-stone-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-stone-400">
          <div>Showing <strong className="text-white">{filteredItems.length}</strong> matching builds & apps in ecosystem</div>
          <div className="font-mono text-[10px] text-emerald-400">Origin Jump Active</div>
        </div>

        {/* Grid of Items */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 space-y-3 bg-[#0D1220]/50 rounded-3xl border border-stone-800">
            <div className="text-4xl">🔍</div>
            <div className="text-base font-bold text-white">No ecosystem builds found</div>
            <p className="text-xs text-stone-400">Try searching for another letter or keyword (e.g. 'A', 'S', 'Wallet', 'Cinema')</p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedLetter("ALL"); setSelectedCategory("ALL"); }}
              className="mt-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  recordVisit(item.name);
                  onNavigateTab(item.originTab);
                  if (onClose) onClose();
                }}
                className="bg-[#111726]/80 hover:bg-[#161f33] border border-stone-800 hover:border-emerald-500/50 p-5 rounded-2xl flex flex-col justify-between space-y-4 transition-all cursor-pointer group shadow-lg hover:shadow-[0_0_20px_rgba(0,255,163,0.15)] relative overflow-hidden"
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-stone-800/80 text-stone-300 border border-stone-700/60">
                    {item.category}
                  </span>
                  <span className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-xs flex items-center justify-center">
                    {item.letter}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-1.5">
                  <h3 className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Tags & Yield */}
                <div className="space-y-3 pt-2 border-t border-stone-800/80">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[10px] font-bold text-stone-400 bg-stone-900 px-2 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {item.yieldUsdt !== undefined ? (
                      <div className="text-xs font-mono font-bold text-emerald-400">
                        ${item.yieldUsdt.toLocaleString()} USDT
                      </div>
                    ) : (
                      <div className="text-xs font-mono font-bold text-stone-400">
                        {item.status}
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-xs font-bold text-stone-300 group-hover:text-white bg-stone-800 group-hover:bg-emerald-500 group-hover:text-black px-3 py-1.5 rounded-xl transition-all">
                      <span>Jump to Origin</span>
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* FOOTER BAR */}
      <div className="h-14 border-t border-stone-800 bg-[#0B0E17]/90 px-6 flex items-center justify-between text-xs text-stone-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Universal Ecosystem Tracker Active — Click any card to return to origin build</span>
        </div>
        <div className="font-mono text-[10px] text-stone-500">
          AlphaQubit Ecosystem Search Home v2024
        </div>
      </div>

    </div>
  );
};
