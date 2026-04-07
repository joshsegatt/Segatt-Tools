use sysinfo::{System, CpuRefreshKind, MemoryRefreshKind};
use serde::Serialize;
use std::sync::Mutex;
use tauri::{State, Window, Emitter};
use std::process::Command;
#[derive(Serialize)]
pub struct SystemStats {
    pub cpu_usage: f32,
    pub used_memory: u64,
    pub total_memory: u64,
}

pub struct SystemState(pub Mutex<System>);

#[tauri::command]
pub fn get_system_stats(state: State<'_, SystemState>) -> SystemStats {
    let mut sys = state.0.lock().unwrap();
    
    // Refresh only what we need for performance
    sys.refresh_cpu_specifics(CpuRefreshKind::new().with_cpu_usage());
    sys.refresh_memory_specifics(MemoryRefreshKind::new().with_ram());
    
    let cpu_usage = sys.global_cpu_usage();
    let used_memory = sys.used_memory() / 1024 / 1024; // Convert to MB
    let total_memory = sys.total_memory() / 1024 / 1024; // Convert to MB
    
    SystemStats {
        cpu_usage,
        used_memory,
        total_memory,
    }
}

#[tauri::command]
pub fn open_legacy_panel(panel: String) -> Result<(), String> {
    let output = if panel.ends_with(".msc") {
        Command::new("mmc.exe")
            .arg(panel)
            .spawn()
    } else if panel.ends_with(".cpl") {
        Command::new("control.exe")
            .arg(panel)
            .spawn()
    } else {
        Command::new("cmd.exe")
            .args(["/C", "start", "", &panel])
            .spawn()
    };

    output.map(|_| ()).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn run_system_fix(window: Window, id: String) -> Result<(), String> {
    let (task_name, cmd_str) = match id.as_str() {
        "sfc" => ("System File Checker (SFC)", "sfc /scannow"),
        "dism" => ("Deployment Image Servicing (DISM)", "DISM /Online /Cleanup-Image /RestoreHealth"),
        _ => return Err("Unknown fix ID".to_string()),
    };

    let _ = window.emit("system-fix-log", format!("Spawning Installer for: {}", task_name));

    let status = crate::features::utils::spawn_visible_powershell(task_name, cmd_str)
        .map_err(|e| e.to_string())?;

    if status.success() {
        let _ = window.emit("system-fix-log", format!("✓ Done: {}", task_name));
        Ok(())
    } else {
        Err(format!("System fix failed or was cancelled."))
    }
}
