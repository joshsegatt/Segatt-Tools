use sysinfo::{System, CpuRefreshKind, MemoryRefreshKind};
use serde::Serialize;
use std::sync::Mutex;
use tauri::State;

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
