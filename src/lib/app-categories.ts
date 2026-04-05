// Segatt Tools — App Categories (CTT-style)
// Predefined app catalog organized by category

export interface AppEntry {
  id: string;           // WinGet package ID
  name: string;         // Display name
  description: string;  // Short description (for tooltip)
  website?: string;
}

export interface AppCategory {
  key: string;
  label: string;
  icon: string; // lucide icon name
  apps: AppEntry[];
}

export const APP_CATEGORIES: AppCategory[] = [
  {
    key: "browsers",
    label: "Browsers",
    icon: "Globe",
    apps: [
      { id: "Google.Chrome",          name: "Google Chrome",    description: "Google's fast and secure web browser" },
      { id: "Mozilla.Firefox",        name: "Mozilla Firefox",  description: "Privacy-focused open-source browser" },
      { id: "Brave.Brave",            name: "Brave",            description: "Chromium-based browser with built-in ad blocking" },
      { id: "Microsoft.Edge",         name: "Microsoft Edge",   description: "Chromium-based browser integrated with Windows" },
      { id: "Opera.Opera",            name: "Opera",            description: "Feature-rich browser with built-in VPN" },
      { id: "Vivaldi.Vivaldi",        name: "Vivaldi",          description: "Highly customizable browser for power users" },
    ],
  },
  {
    key: "development",
    label: "Development",
    icon: "Code2",
    apps: [
      { id: "Microsoft.VisualStudioCode", name: "VS Code",          description: "Lightweight, extensible code editor by Microsoft" },
      { id: "Git.Git",                    name: "Git",              description: "Distributed version control system" },
      { id: "Python.Python.3.12",         name: "Python 3.12",      description: "High-level programming language" },
      { id: "OpenJS.NodeJS.LTS",          name: "Node.js LTS",      description: "JavaScript runtime built on Chrome's V8 engine" },
      { id: "Microsoft.WindowsTerminal",  name: "Windows Terminal", description: "Modern terminal app for PowerShell, CMD, WSL" },
      { id: "Microsoft.PowerShell",       name: "PowerShell 7",     description: "Cross-platform task automation and configuration" },
      { id: "Docker.DockerDesktop",       name: "Docker Desktop",   description: "Build and run containerized applications" },
      { id: "JetBrains.Toolbox",          name: "JetBrains Toolbox",description: "Manage all JetBrains IDEs from one place" },
    ],
  },
  {
    key: "gaming",
    label: "Gaming",
    icon: "Gamepad2",
    apps: [
      { id: "Valve.Steam",                  name: "Steam",              description: "World's largest PC gaming platform" },
      { id: "Discord.Discord",              name: "Discord",            description: "Voice, video, and text communication for gamers" },
      { id: "Nvidia.GeForceExperience",     name: "GeForce Experience", description: "Optimize games and update GPU drivers" },
      { id: "EpicGames.EpicGamesLauncher",  name: "Epic Games",         description: "Game store offering free titles weekly" },
      { id: "GOG.Galaxy",                   name: "GOG Galaxy",         description: "DRM-free gaming platform" },
    ],
  },
  {
    key: "media",
    label: "Media",
    icon: "Music",
    apps: [
      { id: "VideoLAN.VLC",              name: "VLC",          description: "Free and open-source multimedia player" },
      { id: "Spotify.Spotify",           name: "Spotify",      description: "Music streaming with offline playback" },
      { id: "OBSProject.OBSStudio",      name: "OBS Studio",   description: "Free software for video recording and live streaming" },
      { id: "GIMP.GIMP",                 name: "GIMP",         description: "GNU Image Manipulation Program (Photoshop alternative)" },
      { id: "Audacity.Audacity",         name: "Audacity",     description: "Free, open-source audio editing software" },
      { id: "HandBrake.HandBrake",       name: "HandBrake",    description: "Open-source video transcoder" },
    ],
  },
  {
    key: "utilities",
    label: "Utilities",
    icon: "Wrench",
    apps: [
      { id: "Microsoft.PowerToys",           name: "PowerToys",         description: "Windows system utilities for power users by Microsoft" },
      { id: "Notepad++.Notepad++",           name: "Notepad++",         description: "Free, powerful text editor for developers" },
      { id: "7zip.7zip",                     name: "7-Zip",             description: "High compression ratio file archiver" },
      { id: "RevoUninstaller.RevoUninstaller",name: "Revo Uninstaller", description: "Force remove apps and clean leftover files" },
      { id: "voidtools.Everything",          name: "Everything",        description: "Instant search for files by name across your drive" },
      { id: "Bitwarden.Bitwarden",           name: "Bitwarden",        description: "Open-source password manager" },
      { id: "Rustlang.Rustup",               name: "Rust",             description: "Systems programming language focused on safety" },
    ],
  },
  {
    key: "communication",
    label: "Communication",
    icon: "MessageSquare",
    apps: [
      { id: "Microsoft.Teams",           name: "Microsoft Teams",    description: "Collaboration platform for chat, video, and files" },
      { id: "SlackTechnologies.Slack",   name: "Slack",              description: "Team messaging and collaboration platform" },
      { id: "Zoom.Zoom",                 name: "Zoom",               description: "Video conferencing and online meeting software" },
      { id: "Telegram.TelegramDesktop",  name: "Telegram",           description: "Fast, secure, and privacy-focused messaging" },
      { id: "WhatsApp.WhatsApp",         name: "WhatsApp",           description: "WhatsApp desktop app" },
    ],
  },
];

export type InstalledStatus = "not-installed" | "installing" | "installed" | "error";

export interface AppState extends AppEntry {
  category: string;
  status: InstalledStatus;
  isSelected: boolean;
}
