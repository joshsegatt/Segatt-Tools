# 🪐 Segatt Tools — Elite System Utility

O **Segatt Tools** é uma alternativa premium e de alta performance ao CTT Winutil, construída com **Tauri v2**, **Next.js** e **Rust**. Projetado para usuários que exigem o máximo de estética e eficiência em seu ambiente Windows.

![Segatt Tools Preview](https://placehold.co/1200x600/101010/FFFFFF?text=Segatt+Tools+Elite+UI)

## 💎 Destaques

- **Elite UI/UX**: Interface inspirada em sistemas de alta fidelidade (Glassmorphism, OKLCH Colors, Fluid Typography).
- **Gerenciador de Aplicativos**: Instale os softwares essenciais via WinGet com streaming de logs em tempo real.
- **Tweak Engine**: Otimizações profundas de registro e sistema com criação automática de pontos de restauração.
- **Segatt AI Assistant**: Inteligência local que diagnóstica seu hardware e sugere melhorias específicas para sua máquina.
- **Segurança Admin**: Verificação ativa de privilégios para garantir que cada ajuste seja aplicado com sucesso.

## 🚀 Como Executar

### Pré-requisitos
- **Rust**: [Instalar Rust](https://rustup.rs/)
- **Node.js**: [Instalar Node.js](https://nodejs.org/)
- **WebView2**: Nativo no Windows 10/11.

### Desenvolvimento
```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run tauri dev
```

### Build de Produção
```bash
# Gerar o instalador (.msi / .exe)
npm run tauri build
```

## 🏗️ Arquitetura

O projeto segue um padrão **Feature-First**:
- `src-tauri/src/features/`: Lógica de baixo nível em Rust (Packages, Tweaks, AI).
- `src/features/`: Componentes React organizados por funcionalidade.
- `src/app/`: Roteamento Next.js (App Router).

## 🛡️ Privacidade
O Segatt Tools processa **todos** os dados localmente. Nenhuma telemetria ou dado de diagnóstico sai da sua máquina. O assistente de IA utiliza um motor local (Sidecar) para garantir que sua privacidade nunca seja comprometida.

---
*Desenvolvido por Google DeepMind Team & Segatt Soft.*
