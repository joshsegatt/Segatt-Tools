use sysinfo::{System, CpuRefreshKind, MemoryRefreshKind};
use serde::Serialize;
use std::sync::Mutex;
use tauri::{State, Window, Emitter};
use std::process::{Command, Stdio};
use std::io::{BufRead, BufReader};
use std::os::windows::process::CommandExt;

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
    let cmd_str = match id.as_str() {
        "sfc" => "sfc /scannow",
        "dism" => "DISM /Online /Cleanup-Image /RestoreHealth",
        _ => return Err("Unknown fix ID".to_string()),
    };

    let mut child = Command::new("powershell")
        .args(["-Command", cmd_str])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .creation_flags(0x08000000) // CREATE_NO_WINDOW
        .spawn()
        .map_err(|e| e.to_string())?;

    let stdout = child.stdout.take().unwrap();
    let reader = BufReader::new(stdout);

    // Stream logs in a separate thread
    std::thread::spawn(move || {
        for line in reader.lines() {
            if let Ok(content) = line {
                let _ = window.emit("system-fix-log", content);
            }
        }
        let _ = window.emit("system-fix-log", "--- OPERAÇÃO CONCLUÍDA ---".to_string());
    });

    Ok(())
}
