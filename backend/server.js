const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(cors());

/* =========================
   ✅ DATABASE (RAILWAY)
========================= */
const db = mysql.createConnection({
    host: "caboose.proxy.rlwy.net",   // ✅ من Railway
    user: "root",                     // ✅ من Railway
    password: "YOUR_PASSWORD",        // ❗ حط الباسورد الحقيقي
    database: "railway",              // ✅ كما هو
    port: 12345                       // ❗ حط البورت الحقيقي
});

db.connect(err => {
    if (err) {
        console.log("❌ DB Error:", err);
    } else {
        console.log("✅ Database Connected");
    }
});

/* =========================
   ✅ EMAIL
========================= */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your_email@gmail.com',
        pass: 'your_app_password'
    }
});

function sendEmail(status){
    transporter.sendMail({
        from: 'your_email@gmail.com',
        to: 'client@email.com',
        subject: 'Claim Update',
        text: 'Your claim status is: ' + status
    });
}

/* =========================
   ✅ AI HELPER
========================= */
function aiHelper(text){

    let notes = "";

    if(text.includes("حادث")) notes += "Accident Case. ";
    if(text.includes("سرقة")) notes += "Theft Case. ";
    if(text.includes("حريق")) notes += "Fire Risk. ";

    return notes;
}

/* =========================
   ✅ FRAUD
========================= */
function fraudScore(claim){

    let score = 0;
    let amount = Number(claim.amount) || 0;

    if(amount >= 50000) score += 70;
    else if(amount >= 20000) score += 40;
    else if(amount >= 10000) score += 20;

    return score;
}

function fraudLevel(score){
    if(score >= 70) return "HIGH 🔴";
    if(score >= 40) return "MEDIUM ⚠️";
    return "LOW ✅";
}

/* =========================
   ✅ HOME
========================= */
app.get('/', (req, res) => {
    res.send("ERP System Running ✅");
});

/* =========================
   ✅ LOGIN
========================= */
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
                res.json({ ok:true, user: result[0] });
            } else {
                res.json({ ok:false });
            }

        }
    );
});

/* =========================
   ✅ CREATE CLAIM
========================= */
app.post('/claims', (req, res) => {

    let claim = req.body;

    // ✅ AI
    claim.ai_notes = aiHelper(claim.description || "");

    // ✅ Fraud
    let score = fraudScore(claim);
    claim.fraud_score = score;
    claim.fraud_level = fraudLevel(score);

    db.query("INSERT INTO claims SET ?", claim, (err, result) => {

        if(err){
            console.log(err);
            return res.json({ ok:false });
        }

        const claimId = result.insertId;

        // ✅ workflow
        [1,2,3].forEach(stage => {
            db.query("INSERT INTO approvals SET ?", {
                claim_id: claimId,
                stage_id: stage,
                status: "Pending"
            });
        });

        res.json({ ok:true });
    });

});

/* =========================
