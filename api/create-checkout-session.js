const Stripe = require('stripe');

// 9コース（crowdfunding/index.html の .course-body と対応。tierキー = data-i18n の ttl キーと揃えている）
const TIERS = {
  c1:  { label: 'みつぼし応援団（リターンなし）', amount: 3000 },
  c2:  { label: 'オリジナル缶バッジ＆ポストカード', amount: 3000 },
  c4:  { label: 'みつぼし応援団（リターンなし）', amount: 5000 },
  c5:  { label: '芸術祭会場のパネルにお名前掲出', amount: 5000 },
  c12: { label: '会期の作品集をお届け', amount: 8000 },
  c7:  { label: 'みつぼし応援団（リターンなし）', amount: 10000 },
  c9:  { label: 'オリジナル Tシャツ', amount: 10000 },
  c10: { label: 'ShiroiTo所属作家による似顔絵', amount: 15000 },
  c11: { label: 'みつぼし応援団（リターンなし）', amount: 30000 },
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const tier = req.body && req.body.tier;
  const t = TIERS[tier];
  if (!t) {
    res.status(400).json({ error: 'invalid tier' });
    return;
  }

  const origin = req.headers.origin || `https://${req.headers.host}`;

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'ja',
      line_items: [{
        price_data: {
          currency: 'jpy',
          unit_amount: t.amount,
          product_data: {
            name: `みつぼしART星田2026 支援 - ${t.label}`,
          },
        },
        quantity: 1,
      }],
      metadata: { tier, project: 'mitsuboshi-art-hoshida-2026' },
      success_url: `${origin}/crowdfunding/thanks.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/crowdfunding/?canceled=1`,
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('create-checkout-session error:', err);
    res.status(500).json({ error: 'stripe error' });
  }
};
