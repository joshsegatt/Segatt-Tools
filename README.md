# 🪐 Segatt Tools — Elite Windows System Utility

[![GitHub Release](https://img.shields.io/github/v/release/joshsegatt/Segatt-Tools?style=for-the-badge&color=2eb67d)](https://github.com/joshsegatt/Segatt-Tools/releases)
[![Build Status](https://img.shields.io/github/actions/workflow/status/joshsegatt/Segatt-Tools/build.yml?style=for-the-badge&label=Build)](https://github.com/joshsegatt/Segatt-Tools)
[![Direct Install](https://img.shields.io/badge/Install-PowerShell-blue?style=for-the-badge&logo=powershell)](https://github.com/joshsegatt/Segatt-Tools#-instalação-rápida)

O **Segatt Tools** é uma suite de utilitários premium construída com o estado da arte das tecnologias modernas (**Tauri v2**, **Next.js 15** e **Rust**). Projetado para ser a versão definitiva em performance e estética para o gerenciamento de sistemas Windows.

---

### 🚀 Instalação Rápida (One-Liner)

Copie e cole este comando no seu **PowerShell (Admin)** para instalar o Segatt Tools instantaneamente:

```powershell
iex (irm https://raw.githubusercontent.com/joshsegatt/Segatt-Tools/main/install.ps1)
```

---

## 💎 Diferenciais Elite

Diferente de scripts genéricos, o Segatt Tools foca em **segurança, estética "Figma-grade" e performance nativa**.

| Feature | Descrição | Tecnologia |
| :--- | :--- | :--- |
| **Streaming UI** | Logs do WinGet em tempo real com interface interativa. | Tauri Event Bus |
| **Tweak Engine** | Otimizações profundas com backups automáticos. | Windows API (Rust) |
| **Local AI Assist** | Diagnóstico de hardware por inteligência artificial local. | Llama 3 / Sidecar |
| **Zero Telemetry** | Privacidade absoluta. Nada sai da sua máquina. | Local-Only Processing |

## 🛠️ Arquitetura de Produção

O projeto utiliza um design system baseado em **Glassmorphism** e **Fluid Typography**, garantindo que a aplicação pareça nativa no Windows 11 enquanto mantém uma identidade visual única e moderna.

### Estrutura do Projeto
- **`src-tauri/`**: Núcleo de alta performance em Rust para interações com o Win32 API.
- **`src/features/`**: Componentização modular seguindo padrões da Vercel/Linear.
- **`src/app/`**: Roteamento otimizado com Next.js App Router.

## 🏗️ Desenvolvimento

Se você deseja contribuir ou compilar manualmente:

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar ambiente de desenvolvimento
npm run tauri dev

# 3. Gerar build de produção
npm run tauri build
```

---

## 🛡️ Segurança e Integridade

Todas as alterações de sistema realizadas pelo Segatt Tools são auditáveis e o código é 100% aberto. Recomendamos a criação de um ponto de restauração antes de aplicar Tweaks agressivos (funcionalidade integrada).

---
*Desenvolvido com ❤️ por Segatt Soft & Google DeepMind Team.*
