-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (name) VALUES 
    ('Makanan Utama'),
    ('Minuman'),
    ('Snack'),
    ('Dessert');

-- Modify menu_items table
ALTER TABLE menu_items 
    ADD COLUMN category_id INT,
    ADD COLUMN is_available BOOLEAN DEFAULT TRUE,
    ADD FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Migrate existing data
UPDATE menu_items m 
JOIN categories c ON m.category = c.name 
SET m.category_id = c.id;

-- Drop old category column
ALTER TABLE menu_items DROP COLUMN category; 