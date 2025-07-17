-- Script de inicialización de la base de datos
-- Crear tablas básicas para la aplicación

USE persistencia;

-- Tabla de ejemplo para usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de ejemplo para logs
CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT NOT NULL,
    level ENUM('INFO', 'WARNING', 'ERROR') DEFAULT 'INFO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar algunos datos de ejemplo
INSERT INTO users (username, email) VALUES 
    ('admin', 'admin@example.com'),
    ('user1', 'user1@example.com')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

INSERT INTO logs (message, level) VALUES 
    ('Base de datos inicializada correctamente', 'INFO'),
    ('Sistema listo para operaciones', 'INFO');

-- Mostrar las tablas creadas
SHOW TABLES; 