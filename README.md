# Segatt Tools

Native Windows maintenance suite. Local AI. Zero telemetry.

[Download](https://github.com/joshsegatt/Segatt-Tools/releases/latest) · [MIT license](LICENSE)

A Tauri + Rust + Next.js desktop app that cleans the machine, manages startup, and updates software with winget — without sending data off the device. On-device suggestions run through WebLLM, not an API.

## Features

| | |
| --- | --- |
| System cleaner | Temp files, browser cache, Windows Update leftovers |
| Startup manager | See what launches with Windows and turn it off |
| Winget updater | Batch-upgrade installed apps |
| Local AI | On-device suggestions via WebLLM. No cloud calls |
| Health panel | CPU, RAM, and disk at a glance |
| Privacy | No telemetry, no account, no phone-home |

## Stack

- Desktop — Tauri 2, Rust
- UI — Next.js 16, React 19, TypeScript
- Local model — `@mlc-ai/web-llm`

## Install

**Release build (recommended)**

1. Get the `.msi` or `.exe` from [Releases](https://github.com/joshsegatt/Segatt-Tools/releases/latest).
2. Windows SmartScreen may warn on a new publisher — *More info → Run anyway*.
3. Open **Segatt Tools** from the Start menu.

**From source**

```bash
# Node 18+, Rust stable, Tauri CLI
git clone https://github.com/joshsegatt/Segatt-Tools.git
cd Segatt-Tools
npm install
npm run tauri build
```

Signing keys are not in this repo. For a signed local build set:

```
TAURI_SIGNING_PRIVATE_KEY=
TAURI_SIGNING_PRIVATE_KEY_PASSWORD=
```

## License

[MIT](LICENSE) © Josh Segatt
