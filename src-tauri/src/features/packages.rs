use tauri::{AppHandle, Emitter};
use std::process::{Command, Stdio};
use std::io::{BufReader, BufRead};
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PackageInfo {
    pub name: String,
    pub id: String,
    pub version: String,
    pub source: String,
}

#[tauri::command]
pub async fn search_packages(query: String) -> Result<Vec<PackageInfo>, String> {
    let output = Command::new("winget")
        .args(&["search", &query, "--source", "winget", "--accept-source-agreements"])
        .output()
        .map_err(|e| format!("Falha ao executar WinGet: {}", e))?;

    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr).to_string();
        return Err(format!("Erro do WinGet: {}", err));
    }

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let lines: Vec<&str> = stdout.lines().collect();

    // Auditoria: O parser deve ser resiliente a nomes com espaços (ex: "Visual Studio Code")
    // WinGet retorna colunas de largura fixa baseadas na posição dos cabeçalhos.
    if lines.len() < 3 {
        return Ok(Vec::new());
    }

    let header = lines[0];
    let name_idx = header.find("Name").unwrap_or(0);
    let id_idx = header.find("Id").unwrap_or(30);
    let version_idx = header.find("Version").unwrap_or(60);
    let source_idx = header.find("Source").unwrap_or(80);

    let mut packages = Vec::new();

    // Pular cabeçalho e linha separadora (---)
    for line in lines.iter().skip(2) {
        if line.len() < source_idx { continue; }

        let name = line[name_idx..id_idx].trim().to_string();
        let id = line[id_idx..version_idx].trim().to_string();
        let version = line[version_idx..source_idx].trim().to_string();
        let source = line[source_idx..].trim().to_string();

        if !id.is_empty() {
            packages.push(PackageInfo { name, id, version, source });
        }
    }

    Ok(packages)
}

#[tauri::command]
pub async fn install_package_stream(app: AppHandle, package_id: String) -> Result<(), String> {
    // Audit: Adicionado verificação de spawn bem-sucedido
    let mut child = Command::new("winget")
        .args(&["install", &package_id, "--accept-source-agreements", "--accept-package-agreements", "--silent"])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Erro ao iniciar processo de instalação: {}", e))?;

    let stdout = child.stdout.take().ok_or("Falha ao capturar STDOUT do WinGet")?;
    let reader = BufReader::new(stdout);

    // Stream output para o frontend via Tauri v2 Emitter
    tauri::async_runtime::spawn(async move {
        for line in reader.lines() {
            if let Ok(line) = line {
                // Emitir evento para todas as janelas ouvintes
                let _ = app.emit("winget-output", line);
            }
        }
        let _ = app.emit("winget-output", format!("--- Finalizado: {} ---", package_id));
    });

    Ok(())
}
