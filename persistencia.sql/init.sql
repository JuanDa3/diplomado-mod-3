-- Script de inicialización de la base de datos
-- Crear tablas básicas para la aplicación con soporte para Google OAuth

USE persistencia;

-- Drop existing tables if they exist (to ensure clean schema)
DROP TABLE IF EXISTS file_signatures;
DROP TABLE IF EXISTS shared_files;
DROP TABLE IF EXISTS user_files;
DROP TABLE IF EXISTS public_keys;
DROP TABLE IF EXISTS users;

-- Tabla de usuarios con soporte para Google OAuth
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NULL,
    google_id VARCHAR(255) NULL UNIQUE,
    google_picture VARCHAR(500) NULL,
    auth_provider ENUM('local', 'google') DEFAULT 'local',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email (email),
    UNIQUE KEY unique_google_id (google_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para claves públicas
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

-- Tabla para archivos de usuarios
CREATE TABLE IF NOT EXISTS user_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    file_hash VARCHAR(64) NOT NULL,
    user_id INT NOT NULL,
    is_shared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para archivos compartidos (permite que múltiples usuarios accedan a archivos compartidos)
CREATE TABLE IF NOT EXISTS shared_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_id INT NOT NULL,
    shared_by_user_id INT NOT NULL,
    shared_with_user_id INT NOT NULL,
    can_sign BOOLEAN DEFAULT TRUE,
    can_download BOOLEAN DEFAULT TRUE,
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (file_id) REFERENCES user_files(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_with_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_file_share (file_id, shared_with_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para firmas digitales de archivos
CREATE TABLE IF NOT EXISTS file_signatures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_id INT NOT NULL,
    signer_id INT NOT NULL,
    signature_data TEXT NOT NULL,
    signature_hash VARCHAR(64) NOT NULL,
    signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (file_id) REFERENCES user_files(id) ON DELETE CASCADE,
    FOREIGN KEY (signer_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_file_signer (file_id, signer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de ejemplo para logs
CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT NOT NULL,
    level ENUM('INFO', 'WARNING', 'ERROR') DEFAULT 'INFO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar algunos datos de ejemplo (sin contraseñas hasheadas por seguridad)
-- En producción, las contraseñas deben ser hasheadas con bcrypt
INSERT INTO logs (message, level) VALUES 
    ('Base de datos inicializada correctamente', 'INFO'),
    ('Sistema de autenticación configurado', 'INFO'),
    ('Soporte para Google OAuth habilitado', 'INFO'),
    ('Tabla de usuarios creada con campos para OAuth', 'INFO'),
    ('Sistema de firmas digitales configurado', 'INFO'),
    ('Sistema de archivos compartidos configurado', 'INFO');

-- Mostrar las tablas creadas
SHOW TABLES;

-- Mostrar la estructura de la tabla users para verificar los campos de OAuth
DESCRIBE users; 