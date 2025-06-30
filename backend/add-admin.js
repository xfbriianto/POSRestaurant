const mysql = require("mysql2/promise")
const bcrypt = require("bcrypt")
require("dotenv").config()

// --- GANTI INI JIKA PERLU ---
const newUsername = "admin"
const newPassword = "admin123" // Password yang akan di-hash
// -------------------------

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "restaurant_pos",
}

async function addAdminUser() {
  let connection
  try {
    console.log("Connecting to the database...")
    connection = await mysql.createConnection(dbConfig)
    console.log("✅ Database connected.")

    // Hapus user lama jika ada (opsional, untuk menghindari duplikat)
    console.log(`Checking for existing user '${newUsername}'...`)
    await connection.execute("DELETE FROM admin_users WHERE username = ?", [newUsername])
    console.log("🧹 Old user (if any) removed.")

    // Hash password baru
    console.log("Hashing password...")
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)
    console.log("🔒 Password hashed successfully.")

    // Simpan user baru dengan password yang sudah di-hash
    console.log("Inserting new admin user into the database...")
    await connection.execute(
      "INSERT INTO admin_users (username, password, email, role) VALUES (?, ?, ?, ?)",
      [newUsername, hashedPassword, "admin@example.com", "admin"],
    )

    console.log("\n🎉 Admin user created successfully!")
    console.log(`   Username: ${newUsername}`)
    console.log(`   Password: ${newPassword}`)
    console.log("\nYou can now try logging in with these credentials.")
  } catch (error) {
    console.error("\n❌ An error occurred:", error.message)
  } finally {
    if (connection) {
      await connection.end()
      console.log("\nDatabase connection closed.")
    }
  }
}

addAdminUser() 