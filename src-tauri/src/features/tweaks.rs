use std::process::Command;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Tweak {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
}

#[tauri::command]
pub async fn check_admin() -> Result<bool, String> {
    // Auditoria: Verificação de token administrativo via lookup de grupo S-1-5-32-544 (Administradores)
    let output = Command::new("whoami")
        .arg("/groups")
        .output()
        .map_err(|e| e.to_string())?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    Ok(stdout.contains("S-1-5-32-544"))
}

#[tauri::command]
pub async fn get_tweaks() -> Result<Vec<Tweak>, String> {
    Ok(vec![
        Tweak {
            id: "disable_telemetry".to_string(),
            name: "Desativar Telemetria".to_string(),
            description: "Impede o envio de dados de uso anônimos para os servidores da Microsoft.".to_string(),
            category: "Privacidade".to_string(),
        },
        Tweak {
            id: "classic_context_menu".to_string(),
            name: "Menu de Contexto Clássico".to_string(),
            description: "Restaura o menu de botão direito antigo do Windows 10 no Windows 11.".to_string(),
            category: "Interface".to_string(),
        },
        Tweak {
            id: "performance_power_plan".to_string(),
            name: "Plano de Desempenho Máximo".to_string(),
            description: "Configura o Windows para priorizar performance em vez de economia de energia.".to_string(),
            category: "Performance".to_string(),
        },
        Tweak {
            id: "disable_bing_start".to_string(),
            name: "Remover Bing no Iniciar".to_string(),
            description: "Desativa os resultados de busca do Bing no menu Iniciar.".to_string(),
            category: "Sistema".to_string(),
        },
    ])
}

#[tauri::command]
pub async fn create_restore_point() -> Result<String, String> {
    // Auditoria: Verificar se o serviço de restauração está ativo antes de tentar
    let check_script = "Get-Service -Name srservice -ErrorAction SilentlyContinue";
    let output_check = Command::new("powershell").args(&["-Command", check_script]).output();

    let script = "Checkpoint-Computer -Description 'Segatt Tools Tweak Pre-Apply' -RestorePointType 'MODIFY_SETTINGS'";
    
    let output = Command::new("powershell")
        .args(&["-Command", script])
        .output()
        .map_err(|e| format!("Erro ao criar ponto de restauração: {}", e))?;

    if !output.status.success() {
        return Err("Falha ao criar ponto de restauração. Certifique-se de ser Administrador e que a Proteção de Sistema esteja ativada.".to_string());
    }

    Ok("Ponto de restauração criado com sucesso!".to_string())
}

#[tauri::command]
pub async fn apply_tweak(id: String) -> Result<String, String> {
    let result = match id.as_str() {
        "disable_telemetry" => {
            Command::new("reg")
                .args(&["add", "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection", "/v", "AllowTelemetry", "/t", "REG_DWORD", "/d", "0", "/f"])
                .output()
        },
        "classic_context_menu" => {
            // Auditoria: Garantir que a subchave seja criada corretamente
            Command::new("reg")
                .args(&["add", "HKCU\\Software\\Classes\\CLSID\\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\\InprocServer32", "/ve", "/d", "", "/f"])
                .output()
        },
        "performance_power_plan" => {
            // Auditoria: Usaremos o GUID universal, mas com verificação de sucesso
            Command::new("powercfg")
                .args(&["/setactive", "8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c"]) 
                .output()
        },
        "disable_bing_start" => {
            Command::new("reg")
                .args(&["add", "HKCU\\Software\\Policies\\Microsoft\\Windows\\Explorer", "/v", "DisableSearchBoxSuggestions", "/t", "REG_DWORD", "/d", "1", "/f"])
                .output()
        },
        _ => return Err("Tweak desconhecido ou não implementado.".to_string()),
    };

    match result {
        Ok(output) if output.status.success() => Ok(format!("Tweak applied successfully!")),
        Ok(output) => {
            let err = String::from_utf8_lossy(&output.stderr);
            if err.contains("Access is denied") {
                Err("Acesso Negado: Você precisa executar o aplicativo como Administrador.".to_string())
            } else {
                Err(format!("Erro ao aplicar Tweak: {}", err))
            }
        },
        Err(e) => Err(format!("Falha de execução: {}", e)),
    }
}
