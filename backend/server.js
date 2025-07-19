const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const helmet = require('helmet');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'persistencia-12345',
  database: process.env.DB_NAME || 'persistencia',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create database connection pool
let pool;

async function initializeDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    
    await createTables();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

async function createTables() {
  try {
    // Create users table
    const createUsersTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    // Create public_keys table
    const createKeysTableSQL = `
      CREATE TABLE IF NOT EXISTS public_keys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_name VARCHAR(255) NOT NULL,
        public_key TEXT NOT NULL,
        key_size INT NOT NULL,
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_key_name (key_name),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await pool.execute(createUsersTableSQL);
    await pool.execute(createKeysTableSQL);
    console.log('✅ Database tables created/verified');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    throw error;
  }
}

// Authentication middleware
function authenticateToken(req, res, next) {
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
}

// API Routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'key-pair-backend'
  });
});

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Name, email, and password are required' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }
    
    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ 
        error: 'User with this email already exists' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    
    // Get created user (without password)
    const [users] = await pool.execute(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [result.insertId]
    );
    
    const user = users[0];
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at
      },
      token
    });
    
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ 
      error: 'Failed to register user',
      details: error.message 
    });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }
    
    // Find user by email
    const [users] = await pool.execute(
      'SELECT id, name, email, password FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    
    const user = users[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });
    
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ 
      error: 'Failed to login',
      details: error.message 
    });
  }
});

// Get current user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [req.user.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      user: {
        id: users[0].id,
        name: users[0].name,
        email: users[0].email,
        createdAt: users[0].created_at
      }
    });
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user profile',
      details: error.message 
    });
  }
});

// Get all users (admin only - for now, all authenticated users can access)
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at
      }))
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      details: error.message 
    });
  }
});

// Generate key pair endpoint (updated to include user_id)
app.post('/api/generate-key-pair', authenticateToken, async (req, res) => {
  try {
    const { keyName, keySize = 2048 } = req.body;
    
    if (!keyName || !keyName.trim()) {
      return res.status(400).json({ 
        error: 'Key name is required' 
      });
    }
    
    // Generate RSA key pair
    const { publicKey, privateKey } = generateRSAKeyPair(keySize);
    
    // Save public key to database with user_id
    const savedKey = await savePublicKey(keyName, publicKey, keySize, req.user.userId);
    
    res.json({
      success: true,
      keyName: savedKey.key_name,
      publicKey: savedKey.public_key,
      privateKey: privateKey,
      keySize: savedKey.key_size,
      createdAt: savedKey.created_at
    });
    
  } catch (error) {
    console.error('Error generating key pair:', error);
    res.status(500).json({ 
      error: 'Failed to generate key pair',
      details: error.message 
    });
  }
});

// Get all public keys (updated to filter by user)
app.get('/api/public-keys', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, key_name, public_key, key_size, created_at FROM public_keys WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );
    
    res.json({
      success: true,
      keys: rows
    });
    
  } catch (error) {
    console.error('Error fetching public keys:', error);
    res.status(500).json({ 
      error: 'Failed to fetch public keys',
      details: error.message 
    });
  }
});

// Get public key by name (updated to filter by user)
app.get('/api/public-keys/:keyName', authenticateToken, async (req, res) => {
  try {
    const { keyName } = req.params;
    
    const [rows] = await pool.execute(
      'SELECT id, key_name, public_key, key_size, created_at FROM public_keys WHERE key_name = ? AND user_id = ?',
      [keyName, req.user.userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        error: 'Public key not found' 
      });
    }
    
    res.json({
      success: true,
      key: rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching public key:', error);
    res.status(500).json({ 
      error: 'Failed to fetch public key',
      details: error.message 
    });
  }
});

// Delete public key (updated to filter by user)
app.delete('/api/public-keys/:keyName', authenticateToken, async (req, res) => {
  try {
    const { keyName } = req.params;
    
    const [result] = await pool.execute(
      'DELETE FROM public_keys WHERE key_name = ? AND user_id = ?',
      [keyName, req.user.userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Public key not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Public key deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting public key:', error);
    res.status(500).json({ 
      error: 'Failed to delete public key',
      details: error.message 
    });
  }
});

// Helper functions
function generateRSAKeyPair(keySize) {
  // Generate RSA key pair using Node.js crypto module
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: keySize,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
  
  return { publicKey, privateKey };
}

async function savePublicKey(keyName, publicKey, keySize, userId) {
  try {
    const [result] = await pool.execute(
      'INSERT INTO public_keys (key_name, public_key, key_size, user_id) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE public_key = VALUES(public_key), key_size = VALUES(key_size), updated_at = CURRENT_TIMESTAMP',
      [keyName, publicKey, keySize, userId]
    );
    
    const [rows] = await pool.execute(
      'SELECT * FROM public_keys WHERE key_name = ? AND user_id = ?',
      [keyName, userId]
    );
    
    return rows[0];
    
  } catch (error) {
    console.error('Error saving public key:', error);
    throw error;
  }
}

// Start server
async function startServer() {
  await initializeDatabase();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend API server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  if (pool) {
    await pool.end();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  if (pool) {
    await pool.end();
  }
  process.exit(0);
});

startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}); 