// components/TonPayoutConfig.ts
import { TonConnectUI } from '@tonconnect/ui';

// Production Recipient Settlement Target (Verified On-Chain in Trust Wallet)
export const TARGET_WALLET_USER_FRIENDLY = "UQBLz9rXlNtlzVUMuUHosRBTpUWqfoXQ8WTkyAgtbSVlbnBJ";
export const TARGET_WALLET_RAW = "0:4bcfdad794db65cd550cb941e8b11053a545aa7e85d0f164e4c8082d6d25656e";
export const TARGET_WALLET_BOUNCEABLE = "EQBLz9rXlNtlzVUMuUHosRBTpUWqfoXQ8WTkyAgtbSVlbi2M";

export const PRIMARY_RECEIVER_ADDRESS = TARGET_WALLET_USER_FRIENDLY;
export const PRIMARY_RECEIVER_RAW_ADDRESS = TARGET_WALLET_RAW;
export const INITIAL_SEED_BALANCE_USDT = 10.00; // Trust Wallet live balance: $10.00 USDT

// Raw address ensures 100% resolution on block explorers (eliminates 404 on uninitialized state)
export const TONVIEWER_EXPLORER_URL = `https://tonviewer.com/${TARGET_WALLET_RAW}`;
export const TONVIEWER_RAW_EXPLORER_URL = `https://tonviewer.com/${TARGET_WALLET_RAW}`;
export const TONVIEWER_FRIENDLY_EXPLORER_URL = `https://tonviewer.com/${TARGET_WALLET_USER_FRIENDLY}`;
export const TONSCAN_EXPLORER_URL = `https://tonscan.org/address/${TARGET_WALLET_RAW}`;
export const TONAPI_ACCOUNT_API_URL = `https://tonapi.io/v2/blockchain/accounts/${TARGET_WALLET_RAW}`;

export const ACTIVE_AUTH_KEY = "5dd2...ecb2";
export const PRIMARY_ECOSYSTEM_DOMAIN = "ais-dev-yri2x2xif26llxnhpuguzk-152195627325.asia-east1.run.app";
export const PRIMARY_MIRROR_DOMAIN = "earnings.ink";

export const initTonConnect = (elementId: string) => {
  if (typeof window === "undefined") return null;
  try {
    const origin = window.location?.origin;
    const manifest = (origin && origin !== 'null' && (origin.startsWith('http://') || origin.startsWith('https://')))
      ? `${origin}/tonconnect-manifest.json`
      : 'https://ais-dev-yri2x2xif26llxnhpuguzk-152195627325.asia-east1.run.app/tonconnect-manifest.json';
    return new TonConnectUI({
      manifestUrl: manifest,
      buttonRootId: elementId,
    });
  } catch (err) {
    console.warn("TON Connect initialization warning:", err);
    return null;
  }
};
