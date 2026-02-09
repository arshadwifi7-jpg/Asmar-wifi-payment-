// Same memory storage (webhook se shared)
const voucherDB = new Map();

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { session_id } = req.query;
  
  if (!session_id) {
    return res.status(400).json({ error: 'Session ID required' });
  }
  
  // Retry logic (webhook delay ke liye)
  let retries = 5;
  let data = null;
  
  while (retries > 0) {
    data = voucherDB.get(session_id);
    if (data) break;
    
    await new Promise(r => setTimeout(r, 1000));
    retries--;
  }
  
  if (!data) {
    return res.status(404).json({ error: 'Voucher not found. Please try again.' });
  }
  
  res.json({
    voucher: data.voucher,
    plan: data.plan
  });
};
