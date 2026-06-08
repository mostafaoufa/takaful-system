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

    const { username, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE username=? AND password=?",
        [username, password],
        (err, result) => {

            if (err) {
                console.log(err);
                return res.json({ ok: false });
            }

            if (result.length > 0) {
                res.json({ ok: true, user: result[0] });
            } else {
                res.json({ ok: false });
            }

        }
    );
});

/* ✅ SERVER */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚀 Server running on port " + PORT);
});
``