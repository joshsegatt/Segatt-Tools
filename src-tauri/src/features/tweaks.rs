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
    let result = tauri::async_runtime::spawn_blocking(move || {
        let script = "Checkpoint-Computer -Description 'Segatt Tools Pre-Tweak' -RestorePointType 'MODIFY_SETTINGS'";
        crate::features::utils::spawn_visible_powershell("Create Restore Point", script)
            .map_err(|e| format!("Failed to create restore point: {}", e))
    }).await.map_err(|e| format!("Runtime error: {}", e))?;

    match result {
        Ok(status) if status.success() => {
            Ok("System restore point created successfully.".to_string())
        },
        Ok(_) => {
            Err("Failed. Ensure System Protection is enabled for your C: drive.".to_string())
        },
        Err(e) => Err(e),
    }
}

/// Run a registry command visibly
fn reg_add(args: &[&str], tweak_name: &str) -> std::io::Result<std::process::ExitStatus> {
    let quoted_args: Vec<String> = args.iter().map(|a| format!("\"{}\"", a)).collect();
    let script = format!("& reg.exe {}", quoted_args.join(" "));
    crate::features::utils::spawn_visible_powershell(tweak_name, &script)
}

/// Run a custom tool visibly (like powercfg, sc, bcdedit)
fn exec_visible(program: &str, args: &[&str], tweak_name: &str) -> std::io::Result<std::process::ExitStatus> {
    let quoted_args: Vec<String> = args.iter().map(|a| format!("\"{}\"", a)).collect();
    let script = format!("& {}.exe {}", program, quoted_args.join(" "));
    crate::features::utils::spawn_visible_powershell(tweak_name, &script)
}

#[tauri::command]
pub async fn apply_tweak(id: String) -> Result<String, String> {
    let id_clone = id.clone();
    let result = tauri::async_runtime::spawn_blocking(move || {
        let tweak_name = format!("Apply Tweak: {}", id_clone);
        match id_clone.as_str() {

            // ── Privacy ───────────────────────────────────────────────────────────
            "disable_telemetry" => reg_add(&[
                "add", "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection",
                "/v", "AllowTelemetry", "/t", "REG_DWORD", "/d", "0", "/f",
            ], &tweak_name),
            "disable_cortana" => reg_add(&[
                "add", "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search",
                "/v", "AllowCortana", "/t", "REG_DWORD", "/d", "0", "/f",
            ], &tweak_name),
            "disable_activity_feed" => reg_add(&[
                "add", "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\System",
                "/v", "EnableActivityFeed", "/t", "REG_DWORD", "/d", "0", "/f",
            ], &tweak_name),
            "remove_bing_search" => reg_add(&[
                "add", "HKCU\\Software\\Policies\\Microsoft\\Windows\\Explorer",
                "/v", "DisableSearchBoxSuggestions", "/t", "REG_DWORD", "/d", "1", "/f",
            ], &tweak_name),
            "disable_location" => reg_add(&[
                "add", "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore\\location",
                "/v", "Value", "/t", "REG_SZ", "/d", "Deny", "/f",
            ], &tweak_name),
            "disable_advertising_id" => reg_add(&[
                "add", "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\AdvertisingInfo",
                "/v", "Enabled", "/t", "REG_DWORD", "/d", "0", "/f",
            ], &tweak_name),
            "disable_wifi_sense" => reg_add(&[
                "add", "HKLM\\SOFTWARE\\Microsoft\\WcmSvc\\wifinetworkmanager\\config",
                "/v", "AutoConnectAllowedOEM", "/t", "REG_DWORD", "/d", "0", "/f",
            ], &tweak_name),
            "disable_feedback" => reg_add(&[
                "add", "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection",
                "/v", "DoNotShowFeedbackNotifications", "/t", "REG_DWORD", "/d", "1", "/f",
            ], &tweak_name),

            // ── Performance ───────────────────────────────────────────────────────
            "high_performance_plan" => exec_visible("powercfg", &["/setactive", "8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c"], &tweak_name),
            "disable_superfetch" => exec_visible("sc", &["stop", "SysMain"], &tweak_name),
            "disable_search_indexing" => exec_visible("sc", &["stop", "WSearch"], &tweak_name),
            "disable_visual_fx" => reg_add(&[
                "add", "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects",
                "/v", "VisualFXSetting", "/t", "REG_DWORD", "/d", "2", "/f",
            ], &tweak_name),
            "set_dns_cloudflare" => exec_visible("netsh", &["interface", "ip", "set", "dns", "name=Ethernet", "static", "1.1.1.1"], &tweak_name),
            "disable_game_bar" => reg_add(&[
                "add", "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\GameDVR",
                "/v", "AppCaptureEnabled", "/t", "REG_DWORD", "/d", "0", "/f",
            ], &tweak_name),
            "optimize_hpet" => exec_visible("bcdedit", &["/set", "useplatformtick", "yes"], &tweak_name),

            // ── Interface ─────────────────────────────────────────────────────────
            "dark_mode" => reg_add(&[
                "add", "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize",
                "/v", "AppsUseLightTheme", "/t", "REG_DWORD", "/d", "0", "/f",
            ], &tweak_name),
            "classic_context_menu" => reg_add(&[
                "add", "HKCU\\Software\\Classes\\CLSID\\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\\InprocServer32",
                "/ve", "/d", "", "/f",
            ], &tweak_name),
            "show_file_extensions" => reg_add(&[
                "add", "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced",
                "/v", "HideFileExt", "/t", "REG_DWORD", "/d", "0", "/f",
            ], &tweak_name),
            "show_hidden_files" => reg_add(&[
                "add", "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced",
                "/v", "Hidden", "/t", "REG_DWORD", "/d", "1", "/f",
            ], &tweak_name),
            "disable_mouse_accel" => reg_add(&[
                "add", "HKCU\\Control Panel\\Mouse",
                "/v", "MouseSpeed", "/t", "REG_SZ", "/d", "0", "/f",
            ], &tweak_name),

            // ── System ────────────────────────────────────────────────────────────
            "enable_long_paths" => reg_add(&[
                "add", "HKLM\\SYSTEM\\CurrentControlSet\\Control\\FileSystem",
                "/v", "LongPathsEnabled", "/t", "REG_DWORD", "/d", "1", "/f",
            ], &tweak_name),
            "enable_f8_boot" => exec_visible("bcdedit", &["/set", "{bootmgr}", "displaybootmenu", "yes"], &tweak_name),
            "disable_fast_startup" => reg_add(&[
                "add", "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Power",
                "/v", "HiberbootEnabled", "/t", "REG_DWORD", "/d", "0", "/f",
            ], &tweak_name),
            "disable_windows_update" => reg_add(&[
                "add", "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate",
                "/v", "DisableWindowsUpdateAccess", "/t", "REG_DWORD", "/d", "1", "/f",
            ], &tweak_name),

            // Restore point is handled separately on frontend, but if called:
            "create_restore_point" => {
                let script = "Checkpoint-Computer -Description 'Segatt Tools Pre-Tweak' -RestorePointType 'MODIFY_SETTINGS'";
                crate::features::utils::spawn_visible_powershell("Create Restore Point", script)
            },

            // System Restore UI (not powershell bounded, native app)
            "open_system_restore" => {
                silent_cmd("rstrui.exe")
                    .spawn()
                    .map(|mut c| c.wait().unwrap())
            },

            _ => return Err(std::io::Error::new(std::io::ErrorKind::InvalidInput, format!("Unknown tweak: '{}'", id_clone))),
        }
    }).await.map_err(|e| format!("Runtime error: {}", e))?;

    match result {
        Ok(status) if status.success() => Ok(format!("✓ '{}' applied.", id)),
        Ok(_) => Err("Access Denied — Please ensure you have Administrator privileges.".to_string()),
        Err(e) => Err(format!("Execution failed: {}", e)),
    }
}
