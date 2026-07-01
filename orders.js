const router = require('express').Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { items, address } = req.body;
    let total = 0;
    for (const item of items) {
      const p = await Product.findById(item.product);
      total += p.price * item.quantity;
    }
    const order = await Order.create({ user: req.user._id, items, total, address });
    await User.findByIdAndUpdate(req.user._id, { cart: [] });
    res.status(201).json(order);
  } catch (e) { res.status(400).json({ message: e.message }); }
});
router.get('/my', protect, async (req, res) => {
  res.json(await Order.find({ user: req.user._id }).populate('items.product'));
});
router.get('/', protect, admin, async (req, res) => {
  res.json(await Order.find().populate('user', 'name email').populate('items.product'));
});
router.put('/:id/status', protect, admin, async (req, res) => {
  res.json(await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }));
});
module.exports = router;
