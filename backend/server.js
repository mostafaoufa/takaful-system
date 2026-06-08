const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

/* ✅ DATABASE */
const db = mysql.createConnection({
    host: "caboose.proxy.rlwy.net",
    user: "root",
    password: "YOUR_PASSWORD",
    database: "railway",
    port: 12345
});

db.connect(err => {
    if (err) {
        console.log("❌ DB Error:", err);
    } else {
        console.log("✅ Database Connected");
    }
});

/* ✅ HOME */
app.get('/', (req, res) => {
    res.send("ERP System Running ✅");
});

/* ✅ LOGIN */
app.post('/login', (req, res) => {

    const db = mysql.createPool({
    host: "caboose.proxy.rlwy.net",
    user: "root",
    password: "YOUR_PASSWORD",
    database: "railway",
    port: YOUR_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


/* ✅ SERVER */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚀 Server running on port " + PORT);
});
``