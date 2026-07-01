const router = require('express').Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('cart.product');
  res.json(user.cart);
});
router.post('/add', protect, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const user = await User.findById(req.user._id);
  const i = user.cart.findIndex(x => x.product.toString() === productId);
  if (i > -1) user.cart[i].quantity += quantity;
  else user.cart.push({ product: productId, quantity });
  await user.save();
  res.json(user.cart);
});
router.delete('/remove/:id', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.cart = user.cart.filter(x => x.product.toString() !== req.params.id);
  await user.save();
  res.json(user.cart);
});
module.exports = router;
