<div align="center">

# 🛠️ Segatt Tools

**Native Windows maintenance suite — zero telemetry, zero cloud.**

[![GitHub release](https://img.shields.io/github/v/release/joshsegatt/Segatt-Tools?style=flat-square)](https://github.com/joshsegatt/Segatt-Tools/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Built with Tauri](https://img.shields.io/badge/Built%20with-Tauri-FFC131?style=flat-square&logo=tauri)](https://tauri.app)
[![Rust](https://img.shields.io/badge/Rust-000000?style=flat-square&logo=rust)](https://www.rust-lang.org)
[![Platform: Windows](https://img.shields.io/badge/Platform-Windows-0078d4?style=flat-square&logo=windows)](https://github.com/joshsegatt/Segatt-Tools/releases)

> A fast, lightweight desktop app built with **Tauri + Rust + Next.js** to keep your Windows machine clean, healthy, and running at peak performance — without sending a single byte to the cloud.

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧹 **System Cleaner** | Remove temp files, browser cache, Windows Update residuals |
| 🚀 **Startup Manager** | Audit and disable slow startup programs |
| 📦 **Winget Updater** | Batch-update all installed software via `winget upgrade --all` |
| 🤖 **Local AI Assistant** | On-device AI suggestions (no API calls, 100% local) |
| 📊 **System Health** | CPU / RAM / Disk usage at a glance |
| 🔒 **Privacy First** | Zero telemetry. Zero cloud. Your data stays on your machine. |

---

## 📥 Installation

### Option 1 — Installer (recommended)

1. Download the latest `.msi` or `.exe` from [Releases](https://github.com/joshsegatt/Segatt-Tools/releases)
2. Run the installer — Windows may show a SmartScreen prompt (click **More info → Run anyway**)
3. Launch **Segatt Tools** from the Start Menu

### Option 2 — Build from source

```bash
# Prerequisites: Node.js 18+, Rust (stable), Tauri CLI
git clone https://github.com/joshsegatt/Segatt-Tools.git
cd Segatt-Tools
npm install
npm run tauri build
```

---

## 🔒 Security Note

This repository uses **Tauri's built-in code signing**. Signing keys are **never committed** to this repository. If you are building from source, you will need to supply your own Tauri signing keypair via environment variables:

```
TAURI_SIGNING_PRIVATE_KEY=<your key>
TAURI_SIGNING_PRIVATE_KEY_PASSWORD=<your password>
```

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you would like to change.

---

## 📄 License

[MIT](LICENSE) © 2026 Josh Segatt
