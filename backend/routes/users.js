const router = require('express').Router();
const auth = require('../middleware/auth');
const { dbHelpers } = require('../db/database');

router.get('/', auth, (req, res, next) => {
  try { res.json(dbHelpers.getAllUsers()); }
  catch (err) { next(err); }
});

router.get('/:id', auth, (req, res, next) => {
  try {
    const user = dbHelpers.findUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
});

module.exports = router;
