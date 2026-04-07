use tauri::{AppHandle, Emitter};
use std::process::Command;
use serde::{Serialize, Deserialize};

/// Suppresses the CMD/PowerShell console window on Windows.
/// This is the correct, zero-cost abstraction to prevent windows from flashing.
fn silent_cmd(program: &str) -> Command {
    let mut cmd = Command::new(program);
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
    }
    cmd
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PackageInfo {
    pub name: String,
    pub id: String,
    pub version: String,
    pub source: String,
}

#[tauri::command]
pub async fn search_packages(query: String) -> Result<Vec<PackageInfo>, String> {
    let output = silent_cmd("winget")
        .args(&["search", &query, "--source", "winget", "--accept-source-agreements"])
        .output()
        .map_err(|e| format!("Failed to run WinGet: {}", e))?;

    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr).to_string();
        return Err(format!("WinGet error: {}", err));
    }

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let lines: Vec<&str> = stdout.lines().collect();

    if lines.len() < 3 {
        return Ok(Vec::new());
    }

    let header      = lines[0];
    let name_idx    = header.find("Name").unwrap_or(0);
    let id_idx      = header.find("Id").unwrap_or(30);
    let version_idx = header.find("Version").unwrap_or(60);
    let source_idx  = header.find("Source").unwrap_or(80);

    let mut packages = Vec::new();

    for line in lines.iter().skip(2) {
        if line.len() < source_idx { continue; }
        let name    = line[name_idx..id_idx].trim().to_string();
        let id      = line[id_idx..version_idx].trim().to_string();
        let version = line[version_idx..source_idx].trim().to_string();
        let source  = line[source_idx..].trim().to_string();

        if !id.is_empty() {
            packages.push(PackageInfo { name, id, version, source });
        }
    }

    Ok(packages)
}

#[tauri::command]
pub async fn install_package_stream(app: AppHandle, package_id: String) -> Result<(), String> {
    // Notify the UI that the installation has started
    let _ = app.emit("winget-output", format!("Spawning Installer for: {}", package_id));

    let script = format!("winget install {} --accept-source-agreements --accept-package-agreements", package_id);
    let task_name = format!("Installing {}", package_id);

    let status = crate::features::utils::spawn_visible_powershell(&task_name, &script)
        .map_err(|e| format!("Failed to spawn PowerShell: {}", e))?;

    if status.success() {
        let _ = app.emit("winget-output", format!("✓ Done: {}", package_id));
        Ok(())
    } else {
        Err(format!("Installation failed or was cancelled by user."))
    }
}
