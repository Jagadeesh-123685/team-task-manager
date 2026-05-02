const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbHelpers } = require('../db/database');
const validate = require('../middleware/validate');

// Register
router.post('/register', validate(['name', 'email', 'password']), async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (dbHelpers.findUserByEmail(email)) return res.status(409).json({ error: 'Email already registered' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const hashed = await bcrypt.hash(password, 10);
    const user = dbHelpers.createUser({ name, email, password: hashed, role: role || 'member' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
});

// Login
router.post('/login', validate(['email', 'password']), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = dbHelpers.findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
});

// Me
router.get('/me', require('../middleware/auth'), (req, res, next) => {
  try {
    const user = dbHelpers.findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
});

module.exports = router;
