const Stripe = require('stripe');

// 目標金額(円)。変更する場合はここと crowdfunding/index.html 側の表示文言も合わせて直す
const GOAL = 1000000;

module.exports = async (req, res) => {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  let totalAmount = 0;
  let supporterCount = 0;

  try {
    let page;
    do {
      const result = await stripe.checkout.sessions.search({
        query: "status:'complete' AND metadata['project']:'mitsuboshi-art-hoshida-2026'",
        limit: 100,
        page,
      });
      for (const s of result.data) {
        totalAmount += s.amount_total || 0;
        supporterCount += 1;
      }
      page = result.next_page;
    } while (page);

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json({ totalAmount, supporterCount, goal: GOAL });
  } catch (err) {
    console.error('funding-status error:', err);
    // 取得に失敗してもページを壊さない。フロント側は totalAmount が null なら静的な仮値のまま表示する
    res.status(200).json({ totalAmount: null, supporterCount: null, goal: GOAL });
  }
};
