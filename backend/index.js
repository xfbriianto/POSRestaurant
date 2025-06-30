const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;

// Koneksi ke MongoDB Atlas
MongoClient.connect(uri, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB Atlas');
    // Anda bisa menggunakan client.db() untuk operasi database
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });

// Endpoint sederhana
app.get('/', (req, res) => {
  res.send('Hello from Express + MongoDB Atlas!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});