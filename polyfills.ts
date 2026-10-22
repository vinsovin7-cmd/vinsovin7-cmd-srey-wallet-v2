import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  if (!(window as any).Buffer) {
    (window as any).Buffer = Buffer;
  }
  if (!(window as any).global) {
    (window as any).global = window;
  }
  if (!(window as any).process) {
    (window as any).process = { env: {} };
  }
}

if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = function (...args: any[]) {
    try {
      const first = typeof args[0] === 'string' ? args[0] : '';
      if (
        first.includes('TON_CONNECT_SDK') ||
        first.includes('manifest') ||
        first.includes('postMessage') ||
        first.includes('App manifest')
      ) {
        return; // Suppress TonConnect SDK noise
      }
      const combined = args.map(a => (typeof a === 'string' ? a : (a?.message || ''))).join(' ');
      if (
        combined.includes('TON_CONNECT_SDK') ||
        combined.includes('tonconnect-manifest') ||
        combined.includes('postMessage')
      ) {
        return;
      }
    } catch {}
    originalError.apply(console, args);
  };

  const originalWarn = console.warn;
  console.warn = function (...args: any[]) {
    try {
      const first = typeof args[0] === 'string' ? args[0] : '';
      if (
        first.includes('TON_CONNECT_SDK') ||
        first.includes('manifest') ||
        first.includes('postMessage')
      ) {
        return; // Suppress SDK noise
      }
    } catch {}
    originalWarn.apply(console, args);
  };
}

export { Buffer };
