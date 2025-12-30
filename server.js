const express = require("express");
const path = require("path");
const fs = require("fs");
const { io } = require("socket.io-client");
const { app: electronApp } = require("electron");

const app = express();
const PORT = 3005; // เปลี่ยนเป็น 3005 เพื่อไม่ให้ชนกับโปรแกรมอื่น

// กำหนดที่เก็บไฟล์ Config ไว้ใน AppData ของ Windows
const userDataPath = electronApp.getPath('userData'); 
const GIFT_FILE = path.join(userDataPath, "gift-config.json");
const DONATE_FILE = path.join(userDataPath, "donate-config.json");
const OVERLAY_FILE = path.join(userDataPath, "overlay-config.json");

let state = { current: 0, goal: 10 };
let giftConfig = {};
let donateConfig = { minAmount: 1, bahtPerWin: 1, kwPlus: "บวก", kwMinus: "ลบ", streamlabsToken: "" };
let overlayConfig = { fontSize: 96, outline: 8, colorPositive: "#22c55e", colorNegative: "#f97373", colorZero: "#ffffff", colorGoal: "#ffffff" };

// ฟังก์ชันโหลดและบันทึก JSON
function loadJson(file, def) {
  try { if (fs.existsSync(file)) return Object.assign({}, def, JSON.parse(fs.readFileSync(file, "utf8"))); } catch (e) {}
  return Object.assign({}, def);
}
function saveJson(file, obj) {
  try { 
    if (!fs.existsSync(path.dirname(file))) fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(obj, null, 2), "utf8"); 
  } catch (e) {}
}

// โหลดข้อมูลเริ่มต้น
giftConfig = loadJson(GIFT_FILE, {});
donateConfig = loadJson(DONATE_FILE, donateConfig);
overlayConfig = loadJson(OVERLAY_FILE, overlayConfig);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/fonts", express.static(path.join(__dirname, "fonts")));

// --- API Endpoints ---
app.get("/api/state", (req, res) => res.json(state));
app.post("/api/state", (req, res) => { 
  state = { ...state, ...req.body }; 
  res.json({ ok: true, state }); 
});

app.get("/api/overlay-config", (req, res) => res.json(overlayConfig));
app.post("/api/overlay-config", (req, res) => {
  overlayConfig = { ...overlayConfig, ...req.body };
  saveJson(OVERLAY_FILE, overlayConfig);
  res.json({ ok: true });
});

app.post("/api/tikfinity/delta/:val", (req, res) => {
  state.current += Number(req.params.val);
  res.json({ ok: true, state });
});

// หน้าเว็บหลัก
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "control.html")));
app.get("/overlay", (req, res) => res.sendFile(path.join(__dirname, "public", "overlay.html")));

app.listen(PORT, () => {
  console.log(`Server Online at http://localhost:${PORT}`);
});