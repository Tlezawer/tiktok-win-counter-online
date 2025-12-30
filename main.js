const { app, BrowserWindow, globalShortcut, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const http = require("http");
const path = require("path");

require("./server");

const PORT = 3005;

function sendDelta(delta) {
  const req = http.request({
    hostname: "127.0.0.1",
    port: PORT,
    path: "/api/tikfinity/delta/" + delta,
    method: "POST",
  });
  req.on("error", (e) => console.error("Hotkey error:", e));
  req.end();
}

// ระบบ Auto Update
autoUpdater.on("update-available", () => {
  dialog.showMessageBox({ type: "info", title: "Update Found", message: "พบเวอร์ชันใหม่ กำลังดาวน์โหลดอัตโนมัติ..." });
});

autoUpdater.on("update-downloaded", () => {
  dialog.showMessageBox({ title: "Update Ready", message: "ดาวน์โหลดเสร็จแล้ว จะเริ่มติดตั้งเมื่อปิดโปรแกรม" })
    .then(() => autoUpdater.quitAndInstall());
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1000, height: 900,
    title: "TikTok Win Counter Online v8.0.0",
    icon: path.join(__dirname, "icon.ico"),
    webPreferences: { nodeIntegration: false, contextIsolation: true }
  });
  win.loadURL(`http://localhost:${PORT}`);
}

app.whenReady().then(() => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();

  // ปุ่มลัดใหม่ (Ctrl+Shift+ลูกศร) เพื่อไม่ให้ซ้ำกับโปรแกรมเดิม
  globalShortcut.register("Ctrl+Shift+Up", () => sendDelta(1));
  globalShortcut.register("Ctrl+Shift+Down", () => sendDelta(-1));
  globalShortcut.register("Ctrl+Shift+Right", () => sendDelta(5));
  globalShortcut.register("Ctrl+Shift+Left", () => sendDelta(-5));
});

app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });