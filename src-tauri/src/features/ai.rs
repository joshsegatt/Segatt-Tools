use sysinfo::{System};
use serde::{Serialize, Deserialize};

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
    pub impact: String,
}

#[tauri::command]
pub async fn get_system_context() -> Result<SystemContext, String> {
    let mut sys = System::new_all();
    sys.refresh_all();
    
    std::thread::sleep(std::time::Duration::from_millis(100));
    sys.refresh_cpu_all();

    let total_memory = sys.total_memory() / 1024 / 1024;
    let used_memory = sys.used_memory() / 1024 / 1024;
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

    if context.cpu_usage > 50.0 {
        suggestions.push(TweakSuggestion {
            tweak_id: "high_performance_plan".to_string(),
            reason: "High CPU load detected. Switching to High Performance can stabilize frequencies.".to_string(),
            impact: "High".to_string(),
        });
    }

    if context.os_version.contains("11") {
        suggestions.push(TweakSuggestion {
            tweak_id: "classic_context_menu".to_string(),
            reason: "Windows 11 detected. Classic context menu improves shell responsiveness.".to_string(),
            impact: "Medium".to_string(),
        });
    }

    Ok(SmartDiagnostic { context, suggestions })
}

#[tauri::command]
pub async fn chat_with_segatt_ai(message: String) -> Result<String, String> {
    let msg = message.to_lowercase();
    
    // 1. Detect language (Simple heuristic)
    let is_pt = msg.contains("memória") || msg.contains("lento") || msg.contains("ajuda") || msg.contains("limpar") || msg.contains("como");
    let is_es = msg.contains("ayuda") || msg.contains("lento") || msg.contains("memoria") || msg.contains("limpiar");

    // 2. Mock Real AI logic - Multilingual
    if msg.contains("ram") || msg.contains("memória") || msg.contains("memoria") {
        if is_pt { return Ok("Analisando sua RAM... Recomendo limpar o cache de Shaders e fechar processos pesados.".into()); }
        if is_es { return Ok("Analizando su RAM... Recomendo limpiar el caché de Shaders y cerrar procesos pesados.".into()); }
        return Ok("Analyzing your RAM... I recommend clearing the Shader cache and closing heavy processes.".into());
    }

    if msg.contains("lento") || msg.contains("fps") || msg.contains("perf") {
        if is_pt { return Ok("Para melhorar o FPS, execute a 'Limpeza Gamer' e ative o 'Plano de Desempenho Máximo'.".into()); }
        if is_es { return Ok("Para mejorar el FPS, ejecute la 'Limpieza Gamer' y active el 'Plan de Alto Rendimiento'.".into()); }
        return Ok("To improve FPS, run the 'Gamer Cleanup' and enable the 'High Performance Power Plan'.".into());
    }

    if msg.contains("cleaner") || msg.contains("limpar") || msg.contains("limpeza") || msg.contains("limpiar") {
        if is_pt { return Ok("O módulo de limpeza remove arquivos temporários e caches que retardam o sistema. Tente agora!".into()); }
        return Ok("The cleaner module removes temporary files and caches that slow down your system. Try it now!".into());
    }

    // Default response
    if is_pt { return Ok("Estou aqui para ajudar. Posso analisar seu hardware ou explicar qualquer tweak.".into()); }
    if is_es { return Ok("Estoy aquí para ayudar. Puedo analizar su hardware o explicar cualquier tweak.".into()); }
    Ok("I'm here to help. I can analyze your hardware or explain any tweak to you.".into())
}
