use std::process::Command;
use serde::{Serialize, Deserialize};

/// Creates a Command with CREATE_NO_WINDOW flag on Windows.
/// Prevents any CMD/PowerShell terminal from appearing to the user.
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
pub struct Tweak {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
}

#[tauri::command]
pub async fn check_admin() -> Result<bool, String> {
    let output = silent_cmd("whoami")
        .arg("/groups")
        .output()
        .map_err(|e| e.to_string())?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    Ok(stdout.contains("S-1-5-32-544"))
}

#[tauri::command]
pub async fn get_tweaks() -> Result<Vec<Tweak>, String> {
    // Tweak definitions now live in the frontend (tweaks/page.tsx).
    Ok(vec![])
}

#[tauri::command]
pub async fn create_restore_point() -> Result<String, String> {
    // Execute in a blocking thread to avoid freezing the UI bridge
    let result = tauri::async_runtime::spawn_blocking(move || {
        let script = "Checkpoint-Computer -Description 'Segatt Tools Pre-Tweak' -RestorePointType 'MODIFY_SETTINGS'";

        silent_cmd("powershell")
            .args(&["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", script])
            .output()
            .map_err(|e| format!("Failed to create restore point: {}", e))
    }).await.map_err(|e| format!("Runtime error: {}", e))?;

    match result {
        Ok(output) if output.status.success() => {
            Ok("System restore point created successfully.".to_string())
        },
        Ok(_) => {
            Err("Failed. Ensure System Protection is enabled for your C: drive.".to_string())
        },
        Err(e) => Err(e),
    }
}

/// Run a registry command silently and return Ok/Err based on exit code.
fn reg_add(args: &[&str]) -> std::io::Result<std::process::Output> {
    silent_cmd("reg").args(args).output()
}

#[tauri::command]
pub async fn apply_tweak(id: String) -> Result<String, String> {
    let result: std::io::Result<std::process::Output> = match id.as_str() {

        // ── Privacy ───────────────────────────────────────────────────────────
        "disable_telemetry" => reg_add(&[
            "add", "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection",
            "/v", "AllowTelemetry", "/t", "REG_DWORD", "/d", "0", "/f",
        ]),
        "disable_cortana" => reg_add(&[
            "add", "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search",
            "/v", "AllowCortana", "/t", "REG_DWORD", "/d", "0", "/f",
        ]),
        "disable_activity_feed" => reg_add(&[
            "add", "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\System",
            "/v", "EnableActivityFeed", "/t", "REG_DWORD", "/d", "0", "/f",
        ]),
        "remove_bing_search" => reg_add(&[
            "add", "HKCU\\Software\\Policies\\Microsoft\\Windows\\Explorer",
            "/v", "DisableSearchBoxSuggestions", "/t", "REG_DWORD", "/d", "1", "/f",
        ]),
        "disable_location" => reg_add(&[
            "add", "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore\\location",
            "/v", "Value", "/t", "REG_SZ", "/d", "Deny", "/f",
        ]),
        "disable_advertising_id" => reg_add(&[
            "add", "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\AdvertisingInfo",
            "/v", "Enabled", "/t", "REG_DWORD", "/d", "0", "/f",
        ]),
        "disable_wifi_sense" => reg_add(&[
            "add", "HKLM\\SOFTWARE\\Microsoft\\WcmSvc\\wifinetworkmanager\\config",
            "/v", "AutoConnectAllowedOEM", "/t", "REG_DWORD", "/d", "0", "/f",
        ]),
        "disable_feedback" => reg_add(&[
            "add", "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection",
            "/v", "DoNotShowFeedbackNotifications", "/t", "REG_DWORD", "/d", "1", "/f",
        ]),

        // ── Performance ───────────────────────────────────────────────────────
        "high_performance_plan" => silent_cmd("powercfg")
            .args(&["/setactive", "8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c"])
            .output(),

        "disable_superfetch" => silent_cmd("sc")
            .args(&["stop", "SysMain"])
            .output(),

        "disable_search_indexing" => silent_cmd("sc")
            .args(&["stop", "WSearch"])
            .output(),

        "disable_visual_fx" => reg_add(&[
            "add", "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects",
            "/v", "VisualFXSetting", "/t", "REG_DWORD", "/d", "2", "/f",
        ]),

        "set_dns_cloudflare" => silent_cmd("netsh")
            .args(&["interface", "ip", "set", "dns", "name=Ethernet", "static", "1.1.1.1"])
            .output(),

        "disable_game_bar" => reg_add(&[
            "add", "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\GameDVR",
            "/v", "AppCaptureEnabled", "/t", "REG_DWORD", "/d", "0", "/f",
        ]),

        "optimize_hpet" => silent_cmd("bcdedit")
            .args(&["/set", "useplatformtick", "yes"])
            .output(),

        // ── Interface ─────────────────────────────────────────────────────────
        "dark_mode" => reg_add(&[
            "add", "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize",
            "/v", "AppsUseLightTheme", "/t", "REG_DWORD", "/d", "0", "/f",
        ]),

        "classic_context_menu" => reg_add(&[
            "add", "HKCU\\Software\\Classes\\CLSID\\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\\InprocServer32",
            "/ve", "/d", "", "/f",
        ]),

        "show_file_extensions" => reg_add(&[
            "add", "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced",
            "/v", "HideFileExt", "/t", "REG_DWORD", "/d", "0", "/f",
        ]),

        "show_hidden_files" => reg_add(&[
            "add", "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced",
            "/v", "Hidden", "/t", "REG_DWORD", "/d", "1", "/f",
        ]),

        "disable_mouse_accel" => reg_add(&[
            "add", "HKCU\\Control Panel\\Mouse",
            "/v", "MouseSpeed", "/t", "REG_SZ", "/d", "0", "/f",
        ]),

        // ── System ────────────────────────────────────────────────────────────
        "enable_long_paths" => reg_add(&[
            "add", "HKLM\\SYSTEM\\CurrentControlSet\\Control\\FileSystem",
            "/v", "LongPathsEnabled", "/t", "REG_DWORD", "/d", "1", "/f",
        ]),

        "enable_f8_boot" => silent_cmd("bcdedit")
            .args(&["/set", "{bootmgr}", "displaybootmenu", "yes"])
            .output(),

        "disable_fast_startup" => reg_add(&[
            "add", "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Power",
            "/v", "HiberbootEnabled", "/t", "REG_DWORD", "/d", "0", "/f",
        ]),

        "disable_windows_update" => reg_add(&[
            "add", "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate",
            "/v", "DisableWindowsUpdateAccess", "/t", "REG_DWORD", "/d", "1", "/f",
        ]),

        // Restore point: delegate to dedicated command
        "create_restore_point" => return create_restore_point().await,

        // System Restore UI
        "open_system_restore" => {
            return silent_cmd("rstrui.exe")
                .spawn()
                .map(|_| "System Restore opened.".to_string())
                .map_err(|e| format!("Failed to open System Restore: {}", e));
        },

        _ => return Err(format!("Unknown tweak: '{}'", id)),
    };

    match result {
        Ok(out) if out.status.success() => Ok(format!("✓ '{}' applied.", id)),
        Ok(out) => {
            let err = String::from_utf8_lossy(&out.stderr).to_string();
            if err.to_lowercase().contains("access") || err.to_lowercase().contains("denied") {
                Err("Access Denied — run Segatt Tools as Administrator.".to_string())
            } else {
                Err(format!("Error: {}", err.trim()))
            }
        }
        Err(e) => Err(format!("Execution failed: {}", e)),
    }
}
