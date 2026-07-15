const Stripe = require('stripe');

// Vercelの自動bodyパースを無効化し、署名検証用に生のリクエストボディを受け取る
module.exports.config = { api: { bodyParser: false } };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];
  const rawBody = await readRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // 現状は受信ログのみ。支援者数・金額のカウント更新はデータストア導入後に実装（HANDOVER_NEXT.md参照）
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('checkout completed:', session.id, session.metadata && session.metadata.tier, session.amount_total);
  }

  res.status(200).json({ received: true });
};
