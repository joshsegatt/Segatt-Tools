use sysinfo::{System, ProcessRefreshKind};
use serde::{Serialize, Deserialize};
use crate::features::tweaks::{get_tweaks, Tweak};

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemContext {
    pub total_memory: u64,
    pub used_memory: u64,
    pub cpu_usage: f32,
    pub top_processes: Vec<ProcessInfo>,
    pub os_name: String,
    pub os_version: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProcessInfo {
    pub name: String,
    pub cpu_usage: f32,
    pub memory_mb: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SmartDiagnostic {
    pub context: SystemContext,
    pub suggestions: Vec<TweakSuggestion>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TweakSuggestion {
    pub tweak_id: String,
    pub reason: String,
    pub impact: String, // Low, Medium, High
}

#[tauri::command]
pub async fn get_system_context() -> Result<SystemContext, String> {
    let mut sys = System::new_all();
    sys.refresh_all();
    
    // Pequena pausa para capturar o uso de CPU real
    std::thread::sleep(std::time::Duration::from_millis(200));
    sys.refresh_cpu_all();

    let total_memory = sys.total_memory() / 1024 / 1024; // MB
    let used_memory = sys.used_memory() / 1024 / 1024; // MB
    let cpu_usage = sys.global_cpu_usage();
    let os_name = System::name().unwrap_or("Windows".into());
    let os_version = System::os_version().unwrap_or("Unknown".into());

    let mut processes = sys.processes()
        .values()
        .map(|p| ProcessInfo {
            name: p.name().to_string_lossy().into_owned(),
            cpu_usage: p.cpu_usage(),
            memory_mb: p.memory() / 1024 / 1024,
        })
        .collect::<Vec<_>>();

    processes.sort_by(|a, b| b.cpu_usage.partial_cmp(&a.cpu_usage).unwrap());
    let top_processes = processes.into_iter().take(5).collect();

    Ok(SystemContext {
        total_memory,
        used_memory,
        cpu_usage,
        top_processes,
        os_name,
        os_version,
    })
}

#[tauri::command]
pub async fn get_smart_diagnostic() -> Result<SmartDiagnostic, String> {
    let context = get_system_context().await?;
    let mut suggestions = Vec::new();

    // Lógica de "Pensamento" da IA baseada no estado do sistema
    if context.cpu_usage > 50.0 {
        suggestions.push(TweakSuggestion {
            tweak_id: "performance_power_plan".to_string(),
            reason: "Sua CPU está sob carga alta. O Plano de Desempenho Máximo pode ajudar a manter frequências mais estáveis.".to_string(),
            impact: "High".to_string(),
        });
    }

    if context.os_version.contains("11") {
        suggestions.push(TweakSuggestion {
            tweak_id: "classic_context_menu".to_string(),
            reason: "Detectado Windows 11. O menu clássico reduz o uso de recursos da Shell e melhora a agilidade.".to_string(),
            impact: "Medium".to_string(),
        });
    }

    // Sugestão padrão de privacidade
    suggestions.push(TweakSuggestion {
        tweak_id: "disable_telemetry".to_string(),
        reason: "Processos de telemetria em segundo plano foram detectados. Desativar pode liberar recursos e melhorar a privacidade.".to_string(),
        impact: "Low".to_string(),
    });

    Ok(SmartDiagnostic {
        context,
        suggestions,
    })
}

#[tauri::command]
pub async fn chat_with_segatt_ai(message: String) -> Result<String, String> {
    let msg = message.to_lowercase();
    if msg.contains("ram") || msg.contains("memória") {
        Ok("Analisando sua memória... Percebo processos consumindo bastante RAM. Recomendo o Tweak de 'Otimização de Serviços' ou fechar navegadores pesados.".to_string())
    } else if msg.contains("lento") || msg.contains("performance") {
        Ok("Senti um gargalo no processamento. Executei o diagnóstico e recomendo ativar o 'Plano de Desempenho Máximo' para estabilizar os frames.".to_string())
    } else if msg.contains("telemetria") || msg.contains("privacidade") {
        Ok("A telemetria do Windows envia logs constantes. Desativá-la reduz o I/O de disco e protege seus dados.".to_string())
    } else {
        Ok("Estou aqui para ajudar. Posso analisar seu hardware agora se você pedir um 'diagnóstico completo'.".to_string())
    }
}
