// miniapp/services/voucherCron.js
// Standalone Voucher Cron Worker for Telegram Mini App & Server Proxy
const crypto = require('crypto');

function generateVoucherBatch(count = 5, amount = 2.00, currency = 'USDT', campaign = '30MIN_MINIAPP_CRON') {
  const batch = [];
  for (let i = 0; i < count; i++) {
    const randomSegment = crypto.randomBytes(6).toString('hex').toUpperCase().match(/.{1,4}/g).join('-');
    const code = `EARN-${randomSegment}`;
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    batch.push({
      code: code,
      codeHash: codeHash,
      currency: currency,
      amount: amount,
      status: 'ACTIVE',
      campaign: campaign,
      createdAt: new Date().toISOString()
    });
  }
  return batch;
}

module.exports = {
  generateVoucherBatch
};
