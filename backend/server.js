const express = require("express")
const mysql = require("mysql2/promise")
const cors = require("cors")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const menuRoutes = require('./routes/menu')
const orderRoutes = require('./routes/orders')

const app = express()
const PORT = process.env.PORT || 3001
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const mongoUri = process.env.MONGODB_URI;
let db;

MongoClient.connect(mongoUri)
  .then(client => {
    console.log("✅ Connected to MongoDB Atlas");
    db = client.db(); // gunakan database dari URI
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err.message);
  });
// Middleware
app.use(cors())
app.use(express.json())

// Mount menu routes
app.use('/api/menu', menuRoutes)
app.use('/api/orders', orderRoutes)

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "restaurant_pos",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

const pool = mysql.createPool(dbConfig)

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log("✅ Database connected successfully")
    connection.release()
  } catch (error) {
    console.error("❌ Database connection failed:", error.message)
  }
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  jwt.verify(token, process.env.JWT_SECRET || "your-secret-key", (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" })
    }
    req.user = user
    next()
  })
}

// Routes

// Auth Routes
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body

    const [users] = await pool.execute("SELECT * FROM admin_users WHERE username = ?", [username])

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const user = users[0]
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
    )

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Categories Routes
app.get("/api/categories", async (req, res) => {
  try {
    const [categories] = await pool.execute("SELECT * FROM categories ORDER BY name")
    res.json(categories)
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/api/categories", authenticateToken, async (req, res) => {
  try {
    const { name } = req.body

    const [result] = await pool.execute("INSERT INTO categories (name) VALUES (?)", [name])

    const [newCategory] = await pool.execute("SELECT * FROM categories WHERE id = ?", [result.insertId])

    res.status(201).json(newCategory[0])
  } catch (error) {
    console.error("Create category error:", error)
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "Category already exists" })
    } else {
      res.status(500).json({ error: "Internal server error" })
    }
  }
})

// Menu Items Routes
app.get("/api/menu", async (req, res) => {
  try {
    const [menuItems] = await pool.execute(`
      SELECT m.*, c.name as category_name 
      FROM menu_items m 
      LEFT JOIN categories c ON m.category_id = c.id 
      WHERE m.is_available = TRUE 
      ORDER BY c.name, m.name
    `)
    res.json(menuItems)
  } catch (error) {
    console.error("Get menu error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.get("/api/menu/:id", async (req, res) => {
  try {
    const [menuItems] = await pool.execute(
      "SELECT m.*, c.name as category_name FROM menu_items m LEFT JOIN categories c ON m.category_id = c.id WHERE m.id = ?",
      [req.params.id],
    )

    if (menuItems.length === 0) {
      return res.status(404).json({ error: "Menu item not found" })
    }

    res.json(menuItems[0])
  } catch (error) {
    console.error("Get menu item error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/api/menu", authenticateToken, async (req, res) => {
  try {
    const { name, description, price, category_id, image_url } = req.body

    const [result] = await pool.execute(
      "INSERT INTO menu_items (name, description, price, category_id, image_url) VALUES (?, ?, ?, ?, ?)",
      [name, description, price, category_id, image_url],
    )

    const [newMenuItem] = await pool.execute(
      "SELECT m.*, c.name as category_name FROM menu_items m LEFT JOIN categories c ON m.category_id = c.id WHERE m.id = ?",
      [result.insertId],
    )

    res.status(201).json(newMenuItem[0])
  } catch (error) {
    console.error("Create menu item error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.put("/api/menu/:id", authenticateToken, async (req, res) => {
  try {
    const { name, description, price, category_id, image_url, is_available } = req.body

    const [result] = await pool.execute(
      "UPDATE menu_items SET name = ?, description = ?, price = ?, category_id = ?, image_url = ?, is_available = ? WHERE id = ?",
      [name, description, price, category_id, image_url, is_available, req.params.id],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Menu item not found" })
    }

    const [updatedMenuItem] = await pool.execute(
      "SELECT m.*, c.name as category_name FROM menu_items m LEFT JOIN categories c ON m.category_id = c.id WHERE m.id = ?",
      [req.params.id],
    )

    res.json(updatedMenuItem[0])
  } catch (error) {
    console.error("Update menu item error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.delete("/api/menu/:id", authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.execute("DELETE FROM menu_items WHERE id = ?", [req.params.id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Menu item not found" })
    }

    res.json({ message: "Menu item deleted successfully" })
  } catch (error) {
    console.error("Delete menu item error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Tables Routes
app.get("/api/tables", async (req, res) => {
  try {
    const [tables] = await pool.execute("SELECT * FROM restaurant_tables ORDER BY table_number")
    res.json(tables)
  } catch (error) {
    console.error("Get tables error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.put("/api/tables/:tableNumber/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body

    const [result] = await pool.execute("UPDATE restaurant_tables SET status = ? WHERE table_number = ?", [
      status,
      req.params.tableNumber,
    ])

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Table not found" })
    }

    res.json({ message: "Table status updated successfully" })
  } catch (error) {
    console.error("Update table status error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Orders Routes
app.get("/api/orders", async (req, res) => {
  try {
    const { status, table_number } = req.query
    let query = `
      SELECT o.*, 
             GROUP_CONCAT(
               CONCAT(oi.quantity, 'x ', mi.name, ' (', oi.price, ')')
               SEPARATOR ', '
             ) as items_summary
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
    `

    const conditions = []
    const params = []

    if (status) {
      conditions.push("o.status = ?")
      params.push(status)
    }

    if (table_number) {
      conditions.push("o.table_number = ?")
      params.push(table_number)
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ")
    }

    query += " GROUP BY o.id ORDER BY o.created_at DESC"

    const [orders] = await pool.execute(query, params)
    res.json(orders)
  } catch (error) {
    console.error("Get orders error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.get("/api/orders/:id", async (req, res) => {
  try {
    const [orders] = await pool.execute("SELECT * FROM orders WHERE id = ?", [req.params.id])

    if (orders.length === 0) {
      return res.status(404).json({ error: "Order not found" })
    }

    const [orderItems] = await pool.execute(
      `
      SELECT oi.*, mi.name, mi.description 
      FROM order_items oi 
      JOIN menu_items mi ON oi.menu_item_id = mi.id 
      WHERE oi.order_id = ?
    `,
      [req.params.id],
    )

    res.json({
      ...orders[0],
      items: orderItems,
    })
  } catch (error) {
    console.error("Get order error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/api/orders", async (req, res) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const { table_number, notes, items, total } = req.body

    // Insert order
    const [orderResult] = await connection.execute("INSERT INTO orders (table_number, notes, total) VALUES (?, ?, ?)", [
      table_number,
      notes,
      total,
    ])

    const orderId = orderResult.insertId

    // Insert order items
    for (const item of items) {
      await connection.execute(
        "INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.id, item.quantity, item.price],
      )
    }

    // Update table status to occupied
    await connection.execute('UPDATE restaurant_tables SET status = "occupied" WHERE table_number = ?', [table_number])

    await connection.commit()

    // Get the complete order
    const [newOrder] = await pool.execute("SELECT * FROM orders WHERE id = ?", [orderId])

    res.status(201).json(newOrder[0])
  } catch (error) {
    await connection.rollback()
    console.error("Create order error:", error)
    res.status(500).json({ error: "Internal server error" })
  } finally {
    connection.release()
  }
})

app.put("/api/orders/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body

    const [result] = await pool.execute("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Order not found" })
    }

    // If order is completed, free up the table
    if (status === "completed") {
      const [order] = await pool.execute("SELECT table_number FROM orders WHERE id = ?", [req.params.id])

      if (order.length > 0) {
        await pool.execute('UPDATE restaurant_tables SET status = "available" WHERE table_number = ?', [
          order[0].table_number,
        ])
      }
    }

    res.json({ message: "Order status updated successfully" })
  } catch (error) {
    console.error("Update order status error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Statistics Routes
app.get("/api/stats/dashboard", authenticateToken, async (req, res) => {
  try {
    const [orderStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'cooking' THEN 1 ELSE 0 END) as cooking_orders,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN total ELSE 0 END) as today_revenue
      FROM orders
    `)

    const [menuStats] = await pool.execute(`
      SELECT COUNT(*) as total_menu_items
      FROM menu_items 
      WHERE is_available = TRUE
    `)

    const [tableStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_tables,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available_tables,
        SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied_tables
      FROM restaurant_tables
    `)

    res.json({
      orders: orderStats[0],
      menu: menuStats[0],
      tables: tableStats[0],
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Something went wrong!" })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`)
  await testConnection()
})

module.exports = app
