const router = require('express').Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const { category, search, sort } = req.query;
  let q = {};
  if (category) q.category = category;
  if (search) q.name = { $regex: search, $options: 'i' };
  res.json(await Product.find(q).sort(sort === 'price' ? { price: 1 } : { createdAt: -1 }));
});
router.get('/:id', async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
});
router.post('/', protect, admin, async (req, res) => {
  try { res.status(201).json(await Product.create(req.body)); } catch (e) { res.status(400).json({ message: e.message }); }
});
router.put('/:id', protect, admin, async (req, res) => {
  res.json(await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});
router.delete('/:id', protect, admin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});
module.exports = router;
