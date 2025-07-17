# 🔐 Key Pair Generator with Database Storage

A full-stack application for generating RSA key pairs with automatic database storage of public keys. Built with Angular frontend, Node.js backend API, and MySQL database.

## 🏗️ Architecture

- **Frontend**: Angular 20 with modern UI
- **Backend**: Node.js Express API
- **Database**: MySQL with automatic table creation
- **Containerization**: Docker with multi-service orchestration

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Git

### Running the Application

1. **Clone and navigate to the project:**
   ```bash
   cd "Taller I"
   ```

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000
   - Database: localhost:3306

4. **Stop the application:**
   ```bash
   docker-compose down
   ```

## 📁 Project Structure

```
Taller I/
├── angular-front/          # Angular frontend application
│   ├── src/
│   │   └── app/
│   │       └── key-pair-generator/
│   │           ├── key-pair-generator.component.ts
│   │           ├── key-pair-generator.component.html
│   │           └── key-pair-generator.component.css
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .dockerignore
├── backend/                # Node.js backend API
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── .dockerignore
├── persistencia.sql/       # Database initialization
├── docker-compose.yml      # Multi-service orchestration
└── README.md
```

## 🔧 Services

### 1. MySQL Database (`persistencia`)
- **Port**: 3306
- **Database**: `persistencia`
- **User**: `user`
- **Password**: `persistencia-12345`
- **Features**:
  - Automatic table creation
  - Persistent data storage
  - Health checks

### 2. Backend API (`backend-api`)
- **Port**: 3000
- **Features**:
  - RSA key pair generation
  - Database integration
  - RESTful API endpoints
  - Security headers
  - Health monitoring

### 3. Angular Frontend (`angular-frontend`)
- **Port**: 8080
- **Features**:
  - Modern responsive UI
  - Real-time key generation
  - Database integration
  - Download functionality
  - Key management

## 🛠️ API Endpoints

### Key Pair Generation
```http
POST /api/generate-key-pair
Content-Type: application/json

{
  "keyName": "my-server-key",
  "keySize": 2048
}
```

### Get All Public Keys
```http
GET /api/public-keys
```

### Get Public Key by Name
```http
GET /api/public-keys/:keyName
```

### Delete Public Key
```http
DELETE /api/public-keys/:keyName
```

### Health Check
```http
GET /health
```

## 💾 Database Schema

```sql
CREATE TABLE public_keys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(255) NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  key_size INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🎯 Features

### Frontend Features
- ✅ Generate RSA key pairs (1024, 2048, 4096 bits)
- ✅ Download private keys securely
- ✅ View all saved public keys
- ✅ Copy keys to clipboard
- ✅ Delete keys from database
- ✅ Real-time validation
- ✅ Responsive design
- ✅ Error handling

### Backend Features
- ✅ Secure RSA key generation
- ✅ Database persistence
- ✅ RESTful API
- ✅ CORS support
- ✅ Security headers
- ✅ Health monitoring
- ✅ Error handling
- ✅ Connection pooling

### Database Features
- ✅ Automatic table creation
- ✅ Data persistence
- ✅ Unique key names
- ✅ Timestamp tracking
- ✅ Health checks

## 🔒 Security Features

- **Frontend**:
  - Security warnings for private keys
  - Input validation
  - XSS protection

- **Backend**:
  - Helmet security headers
  - CORS configuration
  - Input sanitization
  - Non-root container execution

- **Database**:
  - Prepared statements
  - Connection pooling
  - Unique constraints

## 🐳 Docker Configuration

### Production Build
```bash
# Build and run all services
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Services
```bash
# Build frontend only
docker build -t key-pair-frontend ./angular-front

# Build backend only
docker build -t key-pair-backend ./backend

# Run database only
docker-compose up persistencia
```

## 🔍 Monitoring

### Health Checks
- **Frontend**: http://localhost:8080/health
- **Backend**: http://localhost:3000/health
- **Database**: Automatic MySQL health checks

### Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f angular-frontend
docker-compose logs -f backend-api
docker-compose logs -f persistencia
```

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**:
   ```bash
   # Check port usage
   netstat -tulpn | grep :8080
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :3306
   ```

2. **Database connection issues**:
   ```bash
   # Check database logs
   docker-compose logs persistencia
   
   # Restart database
   docker-compose restart persistencia
   ```

3. **Build failures**:
   ```bash
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

4. **Permission issues** (Linux/Mac):
   ```bash
   # Fix volume permissions
   sudo chown -R $USER:$USER .
   ```

### Development Mode

For development with hot reload:

```bash
# Frontend development
cd angular-front
npm install
npm start

# Backend development
cd backend
npm install
npm run dev
```

## 📝 Environment Variables

### Backend API
- `DB_HOST`: Database host (default: persistencia)
- `DB_PORT`: Database port (default: 3306)
- `DB_NAME`: Database name (default: persistencia)
- `DB_USER`: Database user (default: user)
- `DB_PASSWORD`: Database password (default: persistencia-12345)
- `NODE_ENV`: Environment (default: production)

### Frontend
- `API_URL`: Backend API URL (default: http://backend-api:3000)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs
3. Create an issue with detailed information

---

**Note**: This application generates real RSA key pairs. Always keep private keys secure and never share them. Public keys are stored in the database for sharing purposes. 