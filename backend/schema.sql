CREATE DATABASE IF NOT EXISTS restaurant_pos;
USE restaurant_pos;

CREATE TABLE IF NOT EXISTS menu_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample menu items
INSERT INTO menu_items (name, description, price, category, image_url) VALUES
('Nasi Goreng Spesial', 'Nasi goreng dengan telur, ayam, dan sayuran', 25000, 'Makanan Utama', '/images/nasi-goreng.jpg'),
('Mie Goreng', 'Mie goreng dengan telur dan sayuran', 23000, 'Makanan Utama', '/images/mie-goreng.jpg'),
('Es Teh Manis', 'Teh manis dingin', 5000, 'Minuman', '/images/es-teh.jpg'),
('Sate Ayam', 'Sate ayam dengan bumbu kacang', 30000, 'Makanan Utama', '/images/sate-ayam.jpg'),
('Gado-gado', 'Sayuran dengan bumbu kacang', 20000, 'Makanan Utama', '/images/gado-gado.jpg'),
('Es Jeruk', 'Jeruk segar dingin', 7000, 'Minuman', '/images/es-jeruk.jpg'); 