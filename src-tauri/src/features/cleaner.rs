use std::process::Command;
use serde::{Serialize, Deserialize};


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
        let status = match id.as_str() {
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
                crate::features::utils::spawn_visible_powershell("Clean Temp Files", script)
            },

            // ── Optimization ─────────────────────────────────────────────────────
            "clean_prefetch" => {
                let script = "Remove-Item -Path 'C:\\Windows\\Prefetch\\*' -Force -ErrorAction SilentlyContinue";
                crate::features::utils::spawn_visible_powershell("Clean Prefetch", script)
            },

            "flush_dns" => {
                crate::features::utils::spawn_visible_powershell("Flush DNS", "ipconfig /flushdns")
            },

            "clean_windows_update" => {
                let script = "
                    Stop-Service -Name wuauserv -Force -ErrorAction SilentlyContinue
                    Remove-Item -Path 'C:\\Windows\\SoftwareDistribution\\Download\\*' -Force -Recurse -ErrorAction SilentlyContinue
                    Start-Service -Name wuauserv -ErrorAction SilentlyContinue
                ";
                crate::features::utils::spawn_visible_powershell("Clean Windows Update Download Cache", script)
            },

            // ── Gaming ───────────────────────────────────────────────────────────
            "clean_shader_cache" => {
                let script = "
                    $shaderPath = \"$env:LOCALAPPDATA\\Temp\\NVIDIA Corporation\\NV_Cache\"
                    if (Test-Path $shaderPath) { Remove-Item -Path \"$shaderPath\\*\" -Force -Recurse -ErrorAction SilentlyContinue }
                    $dxPath = \"$env:LOCALAPPDATA\\Microsoft\\DirectX Shader Cache\"
                    if (Test-Path $dxPath) { Remove-Item -Path \"$dxPath\\*\" -Force -Recurse -ErrorAction SilentlyContinue }
                ";
                crate::features::utils::spawn_visible_powershell("Clean Shader Cache", script)
            },

            // ── Elite System Cleaning ────────────────────────────────────────────
            "clean_recycle_bin" => {
                let script = "Clear-RecycleBin -Force -ErrorAction SilentlyContinue";
                crate::features::utils::spawn_visible_powershell("Clean Recycle Bin", script)
            },

            "clean_windows_old" => {
                let script = "if (Test-Path 'C:\\Windows.old') { Remove-Item -Path 'C:\\Windows.old' -Force -Recurse -ErrorAction SilentlyContinue }";
                crate::features::utils::spawn_visible_powershell("Clean Windows.old", script)
            },

            "clean_delivery_optimization" => {
                let script = "
                    Stop-Service -Name DoSvc -Force -ErrorAction SilentlyContinue
                    Remove-Item -Path 'C:\\Windows\\ServiceProfiles\\NetworkService\\AppData\\Local\\Microsoft\\Windows\\DeliveryOptimization\\Cache\\*' -Force -Recurse -ErrorAction SilentlyContinue
                    Start-Service -Name DoSvc -ErrorAction SilentlyContinue
                ";
                crate::features::utils::spawn_visible_powershell("Clean Delivery Optimization Cache", script)
            },

            "clean_thumbnails" => {
                let script = "Get-ChildItem -Path \"$env:LOCALAPPDATA\\Microsoft\\Windows\\Explorer\" -Filter thumbcache_*.db | Remove-Item -Force -ErrorAction SilentlyContinue";
                crate::features::utils::spawn_visible_powershell("Clean Thumbnail Cache", script)
            },

            "clean_logs_minidumps" => {
                let script = "
                    Get-ChildItem -Path 'C:\\Windows' -Filter *.log -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
                    if (Test-Path 'C:\\Windows\\Minidump') { Get-ChildItem -Path 'C:\\Windows\\Minidump' -Filter *.dmp | Remove-Item -Force -ErrorAction SilentlyContinue }
                ";
                crate::features::utils::spawn_visible_powershell("Clean Logs & Minidumps", script)
            },

            _ => return Err(format!("Unknown cleanup task: '{}'", id)),
        }
        .map_err(|e| format!("Failed to execute task: {}", e));

        status
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
