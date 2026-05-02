require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase, dbHelpers } = require('./db/database');
const errorHandler = require('./middleware/errorHandler');

initDatabase();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks',    require('./routes/tasks'));

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', storage: 'JSON file (db.json)', timestamp: new Date().toISOString() })
);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Team Task Manager API  →  http://localhost:${PORT}`);
  console.log(`Storage: JSON file (db.json)`);
});
