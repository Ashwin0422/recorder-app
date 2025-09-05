const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Setup
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] // Replace with your frontend URL
    : ['http://localhost:3000']
}));
app.use(express.json());
app.use(express.static('uploads'));

// Create uploads folder
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// File upload setup
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `recording-${Date.now()}.webm`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files allowed'), false);
    }
  }
});

// Database setup
const db = new sqlite3.Database('database.db');

// Create table
db.run(`
  CREATE TABLE IF NOT EXISTS recordings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    filepath TEXT NOT NULL,
    filesize INTEGER NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Upload video
app.post('/api/recordings', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { filename, path: filepath, size: filesize } = req.file;
  
  db.run(
    'INSERT INTO recordings (filename, filepath, filesize) VALUES (?, ?, ?)',
    [filename, filepath, filesize],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, message: 'Upload successful' });
    }
  );
});

// Get all recordings
app.get('/api/recordings', (req, res) => {
  db.all('SELECT * FROM recordings ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Stream video file
app.get('/api/recordings/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM recordings WHERE id = ?', [id], (err, row) => {
    if (err || !row) {
      return res.status(404).json({ error: 'Recording not found' });
    }
    
    const filePath = path.join(__dirname, row.filepath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Simple file streaming
    res.setHeader('Content-Type', 'video/webm');
    fs.createReadStream(filePath).pipe(res);
  });
});

// Error handling
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ error: 'File too large' });
  }
  res.status(500).json({ error: 'Server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
