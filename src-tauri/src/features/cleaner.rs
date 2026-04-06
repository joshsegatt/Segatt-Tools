use std::process::Command;
use serde::{Serialize, Deserialize};

/// Re-using silent_cmd pattern for consistency.
fn silent_cmd(program: &str) -> Command {
    let mut cmd = Command::new(program);
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
    }
    cmd
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CleanupResult {
    pub task_id: String,
    pub success: bool,
    pub message: String,
}

#[tauri::command]
pub async fn run_cleanup(id: String) -> Result<CleanupResult, String> {
    let id_clone = id.clone();
    
    // Execute in a blocking thread to avoid freezing the UI bridge
    let result = tauri::async_runtime::spawn_blocking(move || {
        match id.as_str() {
            // ── Temp Files ───────────────────────────────────────────────────────
            "clean_temp" => {
                let script = "
                    $paths = @($env:TEMP, 'C:\\Windows\\Temp', \"$env:LOCALAPPDATA\\Temp\")
                    foreach ($path in $paths) {
                        if (Test-Path $path) {
                            Get-ChildItem -Path $path -Recurse | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
                        }
                    }
                ";
                silent_cmd("powershell")
                    .args(&["-NoProfile", "-NonInteractive", "-Command", script])
                    .status()
            },

            // ── Optimization ─────────────────────────────────────────────────────
            "clean_prefetch" => {
                let script = "Remove-Item -Path 'C:\\Windows\\Prefetch\\*' -Force -ErrorAction SilentlyContinue";
                silent_cmd("powershell")
                    .args(&["-NoProfile", "-NonInteractive", "-Command", script])
                    .status()
            },

            "flush_dns" => {
                silent_cmd("ipconfig").arg("/flushdns").status()
            },

            "clean_windows_update" => {
                let script = "
                    Stop-Service -Name wuauserv -Force -ErrorAction SilentlyContinue
                    Remove-Item -Path 'C:\\Windows\\SoftwareDistribution\\Download\\*' -Force -Recurse -ErrorAction SilentlyContinue
                    Start-Service -Name wuauserv -ErrorAction SilentlyContinue
                ";
                silent_cmd("powershell")
                    .args(&["-NoProfile", "-NonInteractive", "-Command", script])
                    .status()
            },

            // ── Gaming ───────────────────────────────────────────────────────────
            "clean_shader_cache" => {
                let script = "
                    $shaderPath = \"$env:LOCALAPPDATA\\Temp\\NVIDIA Corporation\\NV_Cache\"
                    if (Test-Path $shaderPath) { Remove-Item -Path \"$shaderPath\\*\" -Force -Recurse -ErrorAction SilentlyContinue }
                    $dxPath = \"$env:LOCALAPPDATA\\Microsoft\\DirectX Shader Cache\"
                    if (Test-Path $dxPath) { Remove-Item -Path \"$dxPath\\*\" -Force -Recurse -ErrorAction SilentlyContinue }
                ";
                silent_cmd("powershell")
                    .args(&["-NoProfile", "-NonInteractive", "-Command", script])
                    .status()
            },

            // ── Elite System Cleaning ────────────────────────────────────────────
            "clean_recycle_bin" => {
                let script = "Clear-RecycleBin -Force -ErrorAction SilentlyContinue";
                silent_cmd("powershell")
                    .args(&["-NoProfile", "-NonInteractive", "-Command", script])
                    .status()
            },

            "clean_windows_old" => {
                let script = "if (Test-Path 'C:\\Windows.old') { Remove-Item -Path 'C:\\Windows.old' -Force -Recurse -ErrorAction SilentlyContinue }";
                silent_cmd("powershell")
                    .args(&["-NoProfile", "-NonInteractive", "-Command", script])
                    .status()
            },

            "clean_delivery_optimization" => {
                let script = "
                    Stop-Service -Name DoSvc -Force -ErrorAction SilentlyContinue
                    Remove-Item -Path 'C:\\Windows\\ServiceProfiles\\NetworkService\\AppData\\Local\\Microsoft\\Windows\\DeliveryOptimization\\Cache\\*' -Force -Recurse -ErrorAction SilentlyContinue
                    Start-Service -Name DoSvc -ErrorAction SilentlyContinue
                ";
                silent_cmd("powershell")
                    .args(&["-NoProfile", "-NonInteractive", "-Command", script])
                    .status()
            },

            "clean_thumbnails" => {
                let script = "Get-ChildItem -Path \"$env:LOCALAPPDATA\\Microsoft\\Windows\\Explorer\" -Filter thumbcache_*.db | Remove-Item -Force -ErrorAction SilentlyContinue";
                silent_cmd("powershell")
                    .args(&["-NoProfile", "-NonInteractive", "-Command", script])
                    .status()
            },

            "clean_logs_minidumps" => {
                let script = "
                    Get-ChildItem -Path 'C:\\Windows' -Filter *.log -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
                    if (Test-Path 'C:\\Windows\\Minidump') { Get-ChildItem -Path 'C:\\Windows\\Minidump' -Filter *.dmp | Remove-Item -Force -ErrorAction SilentlyContinue }
                ";
                silent_cmd("powershell")
                    .args(&["-NoProfile", "-NonInteractive", "-Command", script])
                    .status()
            },

            _ => return Err(format!("Unknown cleanup task: '{}'", id)),
        }
        .map_err(|e| format!("Failed to execute task: {}", e))
    }).await.map_err(|e| format!("Runtime error: {}", e))?;

    match result {
        Ok(status) if status.success() => Ok(CleanupResult {
            task_id: id_clone.clone(),
            success: true,
            message: format!("✓ Task completed successfully."),
        }),
        Ok(_) => Err(format!("Task failed. Ensure you have the power to clean system assets.")),
        Err(e) => Err(e),
    }
}
