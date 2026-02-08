const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Memory storage (baad mein database add karna)
const voucherDB = new Map();

function generateVoucher() {
  return 'ASMAR-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

module.exports = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      event = req.body;
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    }
  } catch (err) {
    console.log('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const plan = session.metadata.plan;
    
    const voucherCode = generateVoucher();
    
    voucherDB.set(session.id, {
      voucher: voucherCode,
      plan: plan,
      createdAt: new Date()
    });
    
    console.log('✅ Voucher created:', voucherCode, 'for session:', session.id);
  }

  res.json({ received: true });
};

module.exports.config = {
  api: { bodyParser: false },
};
