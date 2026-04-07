use std::process::{Command, ExitStatus};

/// Spawns a visible PowerShell window on Windows with a branded UI.
/// Use this for user-facing tasks where real-time feedback is required.
pub fn spawn_visible_powershell(task_name: &str, script: &str) -> std::io::Result<ExitStatus> {
    let mut cmd = Command::new("powershell");
    
    // The script is wrapped in our premium styling
    let wrapped_script = format!(
        "$host.UI.RawUI.WindowTitle = 'Segatt Tools - {task_name}';\n\
         Clear-Host;\n\
         Write-Host '========================================' -ForegroundColor Cyan;\n\
         Write-Host '        ⚡ SEGATT TOOLS ENGINE ⚡         ' -ForegroundColor White -BackgroundColor DarkBlue;\n\
         Write-Host '========================================' -ForegroundColor Cyan;\n\
         Write-Host 'Task: {task_name}' -ForegroundColor Yellow;\n\
         Write-Host '----------------------------------------' -ForegroundColor DarkGray;\n\
         Write-Host '';\n\
         {script};\n\
         Write-Host '';\n\
         Write-Host '----------------------------------------' -ForegroundColor DarkGray;\n\
         Write-Host '✓ Operation completed successfully! Closing in 3s...' -ForegroundColor Green;\n\
         Start-Sleep -Seconds 3;\n\
         Exit;"
    );

    // Notice we do NOT use `CREATE_NO_WINDOW` here. 
    // This allows Windows to allocate a visible console specifically for this process.
    cmd.args(&[
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-Command",
        &wrapped_script
    ])
    .status()
}
