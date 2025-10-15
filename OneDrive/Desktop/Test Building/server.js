const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./roadmap.db');

// Initialize database tables
db.serialize(() => {
  // Users table for roadmap
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer',
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Milestones table
  db.run(`CREATE TABLE IF NOT EXISTS milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming',
    tags TEXT,
    progress INTEGER DEFAULT 0,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users (id)
  )`);

  // Insert sample users
  const sampleUsers = [
    { email: 'admin@roadmap.com', password: 'admin123', name: 'Admin User', role: 'admin', avatar: 'A' },
    { email: 'manager@roadmap.com', password: 'manager123', name: 'Manager User', role: 'manager', avatar: 'M' },
    { email: 'developer@roadmap.com', password: 'dev123', name: 'Developer User', role: 'developer', avatar: 'D' },
    { email: 'viewer@roadmap.com', password: 'viewer123', name: 'Viewer User', role: 'viewer', avatar: 'V' }
  ];

  sampleUsers.forEach(user => {
    const passwordHash = bcrypt.hashSync(user.password, 10);
    db.run(`INSERT OR IGNORE INTO users (email, password_hash, name, role, avatar) VALUES (?, ?, ?, ?, ?)`,
      [user.email, passwordHash, user.name, user.role, user.avatar]);
  });

  // Insert sample milestones
  const sampleMilestones = [
    {
      title: 'Project Foundation',
      date: 'Q1 2024',
      description: 'Established the core architecture and development environment.',
      status: 'completed',
      tags: 'Architecture,Setup,Planning',
      progress: 100,
      created_by: 1
    },
    {
      title: 'User Authentication',
      date: 'Q1 2024',
      description: 'Implemented secure user authentication system.',
      status: 'completed',
      tags: 'Security,Backend,API',
      progress: 100,
      created_by: 1
    },
    {
      title: 'Advanced Analytics',
      date: 'Q2 2024',
      description: 'Building comprehensive analytics dashboard.',
      status: 'in-progress',
      tags: 'Analytics,Dashboard,Data',
      progress: 65,
      created_by: 2
    }
  ];

  sampleMilestones.forEach(milestone => {
    db.run(`INSERT OR IGNORE INTO milestones (title, date, description, status, tags, progress, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [milestone.title, milestone.date, milestone.description, milestone.status, milestone.tags, milestone.progress, milestone.created_by]);
  });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Register endpoint
app.post('/api/register', (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check if user already exists
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, existingUser) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const avatar = name.charAt(0).toUpperCase();

    db.run('INSERT INTO users (name, email, password_hash, role, avatar) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, role, avatar], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        const token = jwt.sign(
          { id: this.lastID, email: email },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({
          token,
          user: {
            id: this.lastID,
            name,
            email,
            role,
            avatar
          }
        });
      });
  });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  });
});

// Get all milestones
app.get('/api/milestones', authenticateToken, (req, res) => {
  db.all(`
    SELECT m.*, u.name as created_by_name, u.avatar as created_by_avatar 
    FROM milestones m 
    JOIN users u ON m.created_by = u.id 
    ORDER BY m.created_at DESC
  `, (err, milestones) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ milestones });
  });
});

// Create milestone
app.post('/api/milestones', authenticateToken, (req, res) => {
  const { title, date, description, status, tags, progress } = req.body;

  if (!title || !date || !description) {
    return res.status(400).json({ error: 'Title, date, and description are required' });
  }

  const tagsString = Array.isArray(tags) ? tags.join(',') : tags || '';

  db.run('INSERT INTO milestones (title, date, description, status, tags, progress, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, date, description, status || 'upcoming', tagsString, progress || 0, req.user.id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        success: true,
        milestone: {
          id: this.lastID,
          title,
          date,
          description,
          status: status || 'upcoming',
          tags: tagsString,
          progress: progress || 0,
          created_by: req.user.id
        }
      });
    });
});

// Update milestone
app.put('/api/milestones/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, date, description, status, tags, progress } = req.body;

  // Check if user has permission to edit
  db.get('SELECT created_by FROM milestones WHERE id = ?', [id], (err, milestone) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    // Only creator, managers, or admins can edit
    if (milestone.created_by !== req.user.id && !['manager', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const tagsString = Array.isArray(tags) ? tags.join(',') : tags || '';

    db.run('UPDATE milestones SET title = ?, date = ?, description = ?, status = ?, tags = ?, progress = ? WHERE id = ?',
      [title, date, description, status, tagsString, progress, id], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({ success: true });
      });
  });
});

// Delete milestone
app.delete('/api/milestones/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Check if user has permission to delete
  db.get('SELECT created_by FROM milestones WHERE id = ?', [id], (err, milestone) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    // Only creator, managers, or admins can delete
    if (milestone.created_by !== req.user.id && !['manager', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    db.run('DELETE FROM milestones WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ success: true });
    });
  });
});

// Get all users (admin only)
app.get('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.all('SELECT id, name, email, role, avatar, created_at FROM users ORDER BY created_at DESC', (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ users });
  });
});

// Update user profile
app.put('/api/users/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  // Users can only update their own profile, or admins can update any profile
  if (parseInt(id) !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permission denied' });
  }

  // Only admins can change roles
  const updateRole = req.user.role === 'admin' ? role : undefined;

  let query = 'UPDATE users SET name = ?, email = ?';
  let params = [name, email];

  if (updateRole) {
    query += ', role = ?';
    params.push(updateRole);
  }

  query += ' WHERE id = ?';
  params.push(id);

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ success: true });
  });
});

// Delete user (admin only)
app.delete('/api/users/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ success: true });
  });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Roadmap Server running on http://localhost:${PORT}`);
});


