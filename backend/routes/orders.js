const express = require("express")
const router = express.Router()
const db = require("../db") // Assuming db is your configured mysql2 pool

// GET /api/orders
router.get("/", async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, GROUP_CONCAT(CONCAT(mi.name, ' (x', oi.quantity, ')') SEPARATOR ', ') as items_summary
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `)
    res.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /api/orders
router.post("/", async (req, res) => {
  const { table_number, notes, items, total } = req.body
  const connection = await db.getConnection() // Simplified

  try {
    await connection.beginTransaction()

    // 1. Insert into orders table with 'pending' status
    const [orderResult] = await connection.query(
      "INSERT INTO orders (table_number, notes, total, status) VALUES (?, ?, ?, 'pending')",
      [table_number, notes, total],
    )
    const orderId = orderResult.insertId

    // 2. Insert into order_items table
    const orderItemsQueries = items.map((item) =>
      connection.query(
        "INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.id, item.quantity, item.price],
      ),
    )
    await Promise.all(orderItemsQueries)

    // 3. Update table status to 'occupied'
    await connection.query("UPDATE restaurant_tables SET status = 'occupied' WHERE table_number = ?", [
      table_number,
    ])

    await connection.commit()

    // Fetch the full order details to return
    const [newOrder] = await connection.query("SELECT * FROM orders WHERE id = ?", [orderId])
    res.status(201).json(newOrder[0])
  } catch (error) {
    await connection.rollback()
    console.error("Error creating order:", error)
    res.status(500).json({ error: "Failed to create order" })
  } finally {
    connection.release()
  }
})

// PUT /api/orders/:id/status
router.put("/:id/status", async (req, res) => {
  const { id } = req.params
  const { status } = req.body // expecting 'pending', 'cooking', 'completed', 'cancelled'

  try {
    // No need for transaction here, can use the pool directly
    const [result] = await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Order not found" })
    }

    // If order is completed or cancelled, update table status to 'available'
    if (status === 'completed' || status === 'cancelled') {
        const [orderData] = await db.query("SELECT table_number FROM orders WHERE id = ?", [id]);
        if (orderData.length > 0) {
            await db.query("UPDATE restaurant_tables SET status = 'available' WHERE table_number = ?", [orderData[0].table_number]);
        }
    }

    res.json({ message: "Order status updated successfully" })
  } catch (error) {
    console.error("Error updating order status:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

module.exports = router 