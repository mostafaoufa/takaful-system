const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createPool({
    host: "caboose.proxy.rlwy.net",
    user: "root",
    password: "YOUR_PASSWORD",
    database: "railway",
    port: 10000,
    waitForConnections: true,
    connectionLimit: 10
});

app.get('/', (req, res) => {
    res.send("ERP System Running ✅");
});

app.post('/login', (req, res) => {

    const { username, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE username=? AND password=?",
        [username, password],
        (err, result) => {

            if (err) {
                console.log(err);
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running ✅");
});