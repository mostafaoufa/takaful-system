const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

/* ✅ DATABASE (Railway Public) */
const db = mysql.createPool({
    host: "caboose.proxy.rlwy.net",
    user: "root",
    password: "1234",       // 
    database: "railway",
    port: 31936,            // 

    ssl: {
        rejectUnauthorized: false
    },

    waitForConnections: true,
    connectionLimit: 10
});

/* ✅ TEST CONNECTION */
db.getConnection((err, con) => {
    if (err) {
        console.log("❌ DB Error:", err);
    } else {
        console.log("✅ DB Connected");
        con.release();
    }
});

/* ✅ HOME */
app.get('/', (req, res) => {
    res.send("ERP System Running ✅");
});

/* ✅ LOGIN */
app.post('/login', (req, res) => {

    const { username, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE username=? AND password=?",
        [username, password],
        (err, result) => {

            if (err) {
                console.log("❌ Query Error:", err);
                return res.json({ ok:false });
            }

            if (result.length > 0) {
                res.json({ ok:true });
            } else {
                res.json({ ok:false });
            }
        }
    );
});

/* ✅ SERVER */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log("🚀 Server running on port " + PORT);
});