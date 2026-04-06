// Segatt Tools — App Categories (CTT-style)
// Predefined app catalog organized by category

export interface AppEntry {
  id: string;           // WinGet package ID
  name: string;         // Display name
  description: string;  // Short description (for tooltip)
  website?: string;
  foss?: boolean;       // Free and Open Source Software
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
      { id: "Google.Chrome",          name: "Google Chrome",    description: "Fast and secure web browser" },
      { id: "Mozilla.Firefox",        name: "Firefox",          description: "Privacy-focused open-source", foss: true },
      { id: "Brave.Brave",            name: "Brave",            description: "Chromium-based with ad blocking", foss: true },
      { id: "Microsoft.Edge",         name: "Edge",             description: "Microsoft's integrated browser" },
      { id: "Opera.OperaGX",          name: "Opera GX",         description: "The gaming browser" },
      { id: "Vivaldi.Vivaldi",        name: "Vivaldi",          description: "Highly customizable power browser" },
      { id: "LibreWolf.LibreWolf",    name: "LibreWolf",        description: "Privacy-hardened Firefox fork", foss: true },
      { id: "TheBrowserCompany.Arc",  name: "Arc Browser",      description: "Modern, workspace-focused browser" },
      { id: "Ablaze.Floorp",          name: "Floorp",           description: "Customizable and fast Firefox derivative" },
      { id: "Alex313031.Thorium",     name: "Thorium",          description: "Optimized Chromium browser" },
      { id: "Waterfox.Waterfox",      name: "Waterfox",         description: "Fast Firefox variant for power users" },
    ],
  },
  {
    key: "hardware",
    label: "Hardware",
    icon: "Cpu",
    apps: [
      { id: "REALiX.HWiNFO",          name: "HWiNFO",           description: "Hardware monitoring" },
      { id: "CPUID.CPU-Z",            name: "CPU-Z",            description: "Processor & RAM info" },
      { id: "TechPowerUp.GPU-Z",      name: "GPU-Z",            description: "Graphics card details" },
      { id: "CrystalMarkSoftware.CrystalDiskInfo", name: "CrystalDiskInfo", description: "Storage health monitor" },
      { id: "AntibodySoftware.WizTree",name: "WizTree",          description: "Fast disk space analyzer" },
      { id: "MSI.Afterburner",        name: "MSI Afterburner",  description: "GPU overclocking/monitoring" },
      { id: "Maxon.Cinebench",        name: "Cinebench R23",    description: "Industry standard CPU benchmark" },
      { id: "UL.3DMark",              name: "3DMark",           description: "The gamer's GPU benchmark" },
    ],
  },
  {
    key: "gaming",
    label: "Gaming",
    icon: "Gamepad2",
    apps: [
      { id: "Valve.Steam",                  name: "Steam",              description: "Largest PC gaming platform" },
      { id: "Discord.Discord",              name: "Discord",            description: "Communication for gamers" },
      { id: "Nvidia.GeForceExperience",     name: "GeForce Experience", description: "Optimize/update GPU" },
      { id: "EpicGames.EpicGamesLauncher",  name: "Epic Games",         description: "Weekly free games store" },
      { id: "Blizzard.BattleNet",           name: "Battle.net",         description: "Blizzard's game launcher" },
      { id: "Ubisoft.Connect",              name: "Ubisoft Connect",    description: "Ubisoft's ecosystem" },
      { id: "ElectronicArts.EADesktop",     name: "EA App",             description: "EA gaming platform" },
      { id: "Unity.UnityHub",               name: "Unity Hub",          description: "Unity engine manager" },
    ],
  },
  {
    key: "media",
    label: "Media",
    icon: "Music",
    apps: [
      { id: "VideoLAN.VLC",              name: "VLC",          description: "Best open-source player", foss: true },
      { id: "Spotify.Spotify",           name: "Spotify",      description: "Music & podcast streaming" },
      { id: "OBSProject.OBSStudio",      name: "OBS Studio",   description: "Recording and streaming", foss: true },
      { id: "GIMP.GIMP",                 name: "GIMP",         description: "Pro image editor", foss: true },
      { id: "Blender.Blender",           name: "Blender",      description: "3D creation suite", foss: true },
      { id: "HandBrake.HandBrake",       name: "HandBrake",    description: "Video transcoder", foss: true },
      { id: "Streamlabs.StreamlabsDesktop", name: "Streamlabs",  description: "All-in-one streaming app" },
    ],
  },
  {
    key: "utilities",
    label: "Utilities",
    icon: "Wrench",
    apps: [
      { id: "Microsoft.PowerToys",           name: "PowerToys",         description: "System tools for power users" },
      { id: "Notepad++.Notepad++",           name: "Notepad++",         description: "Extensible text editor" },
      { id: "7zip.7zip",                     name: "7-Zip",             description: "High compression archiver", foss: true },
      { id: "RevoUninstaller.RevoUninstaller",name: "Revo Uninstaller", description: "Force clean uninstaller" },
      { id: "voidtools.Everything",          name: "Everything",        description: "Instant file search" },
      { id: "Bitwarden.Bitwarden",           name: "Bitwarden",        description: "Open-source password manager", foss: true },
      { id: "Akeo.Rufus",                    name: "Rufus",            description: "Create bootable USB drives", foss: true },
      { id: "BleachBit.BleachBit",           name: "BleachBit",        description: "Privacy cleaner", foss: true },
    ],
  },
];

export type InstalledStatus = "not-installed" | "installing" | "installed" | "error";

export interface AppState extends AppEntry {
  category: string;
  status: InstalledStatus;
  isSelected: boolean;
}
