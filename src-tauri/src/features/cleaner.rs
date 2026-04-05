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
    let result = match id.as_str() {
        // ── Temp Files ───────────────────────────────────────────────────────
        "clean_temp" => {
            // Limpa %TEMP% e C:\Windows\Temp
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
            // Para o serviço, limpa a pasta e reinicia
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
            // Limpeza de cache de shaders do DirectX (comum para NVIDIA/AMD)
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

        _ => return Err(format!("Unknown cleanup task: '{}'", id)),
    };

    match result {
        Ok(status) if status.success() => Ok(CleanupResult {
            task_id: id.clone(),
            success: true,
            message: format!("✓ Task '{}' completed successfully.", id),
        }),
        Ok(_) => Err(format!("Task '{}' failed. Ensure you are running as Administrator.", id)),
        Err(e) => Err(format!("Failed to execute task: {}", e)),
    }
}
