const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const db = require('../db');

// Get all menu items
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT m.*, c.name as category_name 
            FROM menu_items m 
            LEFT JOIN categories c ON m.category_id = c.id
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add a new menu item
router.post('/', async (req, res) => {
    const { name, description, price, category_id, image_url } = req.body;
    try {
        console.log('Creating menu item:', { name, description, price, category_id, image_url });
        const [result] = await db.query(
            'INSERT INTO menu_items (name, description, price, category_id, image_url) VALUES (?, ?, ?, ?, ?)',
            [name, description, price, category_id, image_url]
        );
        
        // Fetch the created item with category name
        const [newItem] = await db.query(`
            SELECT m.*, c.name as category_name 
            FROM menu_items m 
            LEFT JOIN categories c ON m.category_id = c.id 
            WHERE m.id = ?
        `, [result.insertId]);
        
        res.status(201).json(newItem[0]);
    } catch (error) {
        console.error('Error creating menu item:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Update a menu item
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category_id, image_url } = req.body;
    
    try {
        console.log('Updating menu item:', { id, name, description, price, category_id, image_url });
        
        // First check if the item exists
        const [existing] = await db.query('SELECT * FROM menu_items WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        const [result] = await db.query(
            'UPDATE menu_items SET name = ?, description = ?, price = ?, category_id = ?, image_url = ? WHERE id = ?',
            [name, description, price, category_id, image_url, id]
        );

        // Fetch and return the updated item with category name
        const [updatedItem] = await db.query(`
            SELECT m.*, c.name as category_name 
            FROM menu_items m 
            LEFT JOIN categories c ON m.category_id = c.id 
            WHERE m.id = ?
        `, [id]);
        
        res.json(updatedItem[0]);
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Delete a menu item
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        console.log('Deleting menu item:', id);
        const [result] = await db.query('DELETE FROM menu_items WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        
        res.json({ message: 'Menu item deleted successfully', id });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router; 