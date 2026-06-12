const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createPool({
    host: "caboose.proxy.rlwy.net",
    user: "root",
    password: "GfsvKVIMUAfnDqGeisGVLcggWwdSwKMy",
    database: "railway",
    port: 31936,

    ssl: {
        rejectUnauthorized: false
    },

    waitForConnections: true,
    connectionLimit: 10
});

db.getConnection((err, con) => {
    if (err) {
        console.log("❌ DB Error:", err);
    } else {
        console.log("✅ DB Connected");
        con.release();
    }
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

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log("🚀 Server running on port " + PORT);
});
// ✅ Add Claim
app.post("/addClaim", (req,res)=>{

    const { title, desc } = req.body;

    db.query(
        "INSERT INTO claims (title, description) VALUES (?,?)",
        [title, desc],
        (err,result)=>{
            if(err) return res.json({ok:false});
            res.json({ok:true});
        }
    );

});

// ✅ Get Claims
app.get("/claims", (req,res)=>{

    db.query("SELECT * FROM claims", (err,result)=>{
        if(err) return res.json([]);
        res.json(result);
    });

});
``