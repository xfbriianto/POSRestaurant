const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all categories
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT * FROM categories ORDER BY name');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add a new category
router.post('/', async (req, res) => {
    const { name } = req.body;
    try {
        const [result] = await db.promise().query(
            'INSERT INTO categories (name) VALUES (?)',
            [name]
        );
        res.status(201).json({ id: result.insertId, name });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update a category
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const [result] = await db.promise().query(
            'UPDATE categories SET name = ? WHERE id = ?',
            [name, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ id: Number(id), name });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a category
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.promise().query('DELETE FROM categories WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 