const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const helmet = require('helmet');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

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
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public_keys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_name VARCHAR(255) NOT NULL,
        public_key TEXT NOT NULL,
        key_size INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_key_name (key_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await pool.execute(createTableSQL);
    console.log('✅ Database tables created/verified');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    throw error;
  }
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

// Generate key pair endpoint
app.post('/api/generate-key-pair', async (req, res) => {
  try {
    const { keyName, keySize = 2048 } = req.body;
    
    if (!keyName || !keyName.trim()) {
      return res.status(400).json({ 
        error: 'Key name is required' 
      });
    }
    
    // Generate RSA key pair
    const { publicKey, privateKey } = generateRSAKeyPair(keySize);
    
    // Save public key to database
    const savedKey = await savePublicKey(keyName, publicKey, keySize);
    
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

// Get all public keys
app.get('/api/public-keys', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, key_name, public_key, key_size, created_at FROM public_keys ORDER BY created_at DESC'
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

// Get public key by name
app.get('/api/public-keys/:keyName', async (req, res) => {
  try {
    const { keyName } = req.params;
    
    const [rows] = await pool.execute(
      'SELECT id, key_name, public_key, key_size, created_at FROM public_keys WHERE key_name = ?',
      [keyName]
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

// Delete public key
app.delete('/api/public-keys/:keyName', async (req, res) => {
  try {
    const { keyName } = req.params;
    
    const [result] = await pool.execute(
      'DELETE FROM public_keys WHERE key_name = ?',
      [keyName]
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

async function savePublicKey(keyName, publicKey, keySize) {
  try {
    const [result] = await pool.execute(
      'INSERT INTO public_keys (key_name, public_key, key_size) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE public_key = VALUES(public_key), key_size = VALUES(key_size), updated_at = CURRENT_TIMESTAMP',
      [keyName, publicKey, keySize]
    );
    
    const [rows] = await pool.execute(
      'SELECT * FROM public_keys WHERE key_name = ?',
      [keyName]
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