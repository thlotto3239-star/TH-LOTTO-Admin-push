/**
 * Logger utility — ปิด output ใน production
 * ใช้แทน console.log/warn/error ทุกที่
 */

const isDev = import.meta.env.DEV;

const logger = {
  log: (...args) => { if (isDev) console.log('[TH-ADMIN]', ...args); },
  warn: (...args) => { if (isDev) console.warn('[TH-ADMIN]', ...args); },
  error: (...args) => { if (isDev) console.error('[TH-ADMIN]', ...args); },
  info: (...args) => { if (isDev) console.info('[TH-ADMIN]', ...args); },
};

export default logger;
