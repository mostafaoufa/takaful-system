const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(cors());

/* =========================
   ✅ DATABASE CONNECTION
========================= */
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'takaful_db'
});

db.connect(err => {
    if (err) {
        console.log("❌ DB Error:", err);
    } else {
        console.log("✅ Database Connected");
    }
});

/* =========================
   ✅ EMAIL CONFIG
========================= */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your_email@gmail.com',
        pass: 'your_app_password'
    }
});

function sendEmail(status){
    try{
        transporter.sendMail({
            from: 'your_email@gmail.com',
            to: 'client@email.com',
            subject: 'Claim Update',
            text: 'Your claim status is: ' + status
        });
    }catch(e){
        console.log("Email Error:", e);
    }
}

/* =========================
   ✅ AI FRAUD ENGINE
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
    if(score >= 70) return "HIGH RISK 🔴";
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

    if(!username || !password){
        return res.json({ ok:false, message:"Missing credentials" });
    }

    db.query(
        "SELECT * FROM users WHERE username=? AND password=?",
        [username, password],
        (err, result) => {

            if (err) {
                console.log(err);
                return res.json({ ok:false, message:"DB Error" });
            }

            if (result.length > 0) {
                res.json({ ok: true, user: result[0] });
            } else {
                res.json({ ok: false, message:"Invalid login" });
            }
        }
    );
});

/* =========================
   ✅ GET CLAIMS
========================= */
app.get('/claims', (req, res) => {

    db.query("SELECT * FROM claims", (err, result) => {

        if(err){
            console.log(err);
            return res.json([]);
        }

        res.json(result);
    });
});

/* =========================
   ✅ CREATE CLAIM
========================= */
app.post('/claims', (req, res) => {

    let claim = req.body;

    let score = fraudScore(claim);
    let level = fraudLevel(score);

    claim.fraud_score = score;
    claim.fraud_level = level;

    db.query("INSERT INTO claims SET ?", claim, (err, result) => {

        if(err){
            console.log(err);
            return res.json({ ok:false });
        }

        const claimId = result.insertId;

        // ✅ create workflow stages
        const stages = [1,2,3];

        stages.forEach(stage => {
            db.query("INSERT INTO approvals SET ?", {
                claim_id: claimId,
                stage_id: stage,
                status: "Pending"
            });
        });

        res.json({ ok: true });
    });
});

/* =========================
   ✅ GET APPROVALS
========================= */
app.get('/approvals/:id', (req, res) => {

    db.query(
        "SELECT * FROM approvals WHERE claim_id=? ORDER BY stage_id",
        [req.params.id],
        (err, result) => {

            if(err){
                console.log(err);
                return res.json([]);
            }

            res.json(result);
        }
    );
});

/* =========================
   ✅ APPROVE WITH VALIDATION
========================= */
app.post('/approve', (req, res) => {

    const { id, status, user } = req.body;

    if(!id || !status){
        return res.json({ ok:false, message:"Missing data" });
    }

    db.query("SELECT * FROM approvals WHERE id=?", [id], (err, result) => {

        if(err || result.length === 0){
            return res.json({ ok:false, message:"Invalid ID" });
        }

        let current = result[0];
        let stage = current.stage_id;
        let claimId = current.claim_id;

        // ✅ check previous stage
        if(stage > 1){

            db.query(
                "SELECT * FROM approvals WHERE claim_id=? AND stage_id=?",
                [claimId, stage - 1],
                (e, prevRes) => {

                    if(e || prevRes.length === 0){
                        return res.json({ ok:false, message:"Missing previous stage" });
                    }

                    if(prevRes[0].status !== "Approved"){
                        return res.json({
                            ok:false,
                            message:"❌ Previous stage not approved"
                        });
                    }

                    update();
                }
            );

        } else {
            update();
        }

        function update(){

            db.query(
                "UPDATE approvals SET status=?, approved_by=? WHERE id=?",
                [status, user, id],
                (err2) => {

                    if(err2){
                        return res.json({ ok:false, message:"Update failed" });
                    }

                    sendEmail(status);

                    res.json({ ok:true });
                }
            );
        }

    });

});

/* =========================
   ✅ START SERVER
========================= */
app.listen(3000, () => {
    console.log("🚀 Server running at http://localhost:3000");
});
