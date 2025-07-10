import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import session from 'express-session';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 4000;
const upload = multer({ dest: 'uploads/' });

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(session({ secret: 'dev', resave: false, saveUninitialized: true }));

let db;

async function initDb() {
  db = await open({
    filename: './offer-manager.db',
    driver: sqlite3.Database
  });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT
    );
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      keywords TEXT,
      requirements TEXT,
      dueDate TEXT,
      status TEXT,
      companies TEXT, -- JSON stringified array
      createdAt TEXT,
      userId INTEGER
    );
    CREATE TABLE IF NOT EXISTS offers (
      id TEXT PRIMARY KEY,
      offerRequestId TEXT,
      companyName TEXT,
      contactPerson TEXT,
      contactEmail TEXT,
      offerDetails TEXT,
      pricing TEXT,
      attachments TEXT, -- JSON stringified array
      submittedAt TEXT,
      status TEXT
    );
  `);
  // Add a default user
  await db.run('INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)', ['admin', 'admin']);
}

// Helper to parse JSON fields
function parseJSONField(field: string | null) {
  if (!field) return [];
  try { return JSON.parse(field); } catch { return []; }
}

// Auth endpoints
app.post('/api/login', async (req, res) => {
  // @ts-ignore
  const { username, password } = req.body;
  // @ts-ignore
  const user = await db.get('SELECT * FROM users WHERE username = ? AND password = ?', username, password);
  if (user) {
    // @ts-ignore
    req.session.userId = user.id;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.get('/api/me', async (req, res) => {
  // @ts-ignore
  if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
  // @ts-ignore
  const user = await db.get('SELECT id, username FROM users WHERE id = ?', req.session.userId);
  res.json(user);
});

// Requests CRUD
app.get('/api/requests', async (_req, res) => {
  // @ts-ignore
  const requests = await db.all('SELECT * FROM requests');
  const parsed = requests.map((r: any) => ({
    ...r,
    companies: parseJSONField(r.companies),
  }));
  res.json(parsed);
});

app.post('/api/requests', async (req, res) => {
  // @ts-ignore
  if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
  const { title, description, keywords, requirements, dueDate, status, companies, createdAt } = req.body;
  const id = Math.random().toString(36).substr(2, 9);
  // @ts-ignore
  await db.run(
    'INSERT INTO requests (id, title, description, keywords, requirements, dueDate, status, companies, createdAt, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    id, title, description, keywords, requirements, dueDate, status || 'Submissions Open', JSON.stringify(companies), createdAt || new Date().toISOString(), req.session.userId
  );
  res.json({ id });
});

// Offers CRUD
app.get('/api/offers', async (_req, res) => {
  // @ts-ignore
  const offers = await db.all('SELECT * FROM offers');
  const parsed = offers.map((o: any) => ({
    ...o,
    attachments: parseJSONField(o.attachments),
  }));
  res.json(parsed);
});

app.post('/api/offers', async (req, res) => {
  // @ts-ignore
  if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
  const { offerRequestId, companyName, contactPerson, contactEmail, offerDetails, pricing, attachments, submittedAt, status } = req.body;
  const id = Math.random().toString(36).substr(2, 9);
  // @ts-ignore
  await db.run(
    'INSERT INTO offers (id, offerRequestId, companyName, contactPerson, contactEmail, offerDetails, pricing, attachments, submittedAt, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    id, offerRequestId, companyName, contactPerson, contactEmail, offerDetails, pricing, JSON.stringify(attachments), submittedAt || new Date().toISOString(), status || 'Submitted'
  );
  res.json({ id });
});

// File upload/download
app.post('/api/files', upload.single('file'), (req, res) => {
  // @ts-ignore
  res.json({ filename: req.file?.filename, originalname: req.file?.originalname });
});
app.get('/api/files/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

initDb().then(() => {
  app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
});
