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
pub async fn chat_with_segatt_ai(message: String, language: String) -> Result<String, String> {
    let msg = message.to_lowercase();
    let ctx = get_system_context().await?;
    let is_pt = language == "pt";
    
    // 1. Process specific questions with system context
    
    // RAM / Memory
    if msg.contains("ram") || msg.contains("memór") || msg.contains("memor") {
        let ram_pct = (ctx.used_memory as f32 / ctx.total_memory as f32) * 100.0;
        let p_name = &ctx.top_processes[0].name;
        let free_gb = (ctx.total_memory - ctx.used_memory) as f32 / 1024.0;

        if is_pt {
            return Ok(format!(
                "Análise Técnica de RAM:\n• Uso Atual: {:.1}% ({:.1} GB livres)\n• Maior Consumidor: '{}'\n• Diagnóstico: {}. {}", 
                ram_pct, free_gb, p_name,
                if ram_pct > 80.0 { "Memória crítica detectada" } else { "Saúde da RAM excelente" },
                if ram_pct > 70.0 { "Sugiro usar o Segatt Cleaner agora para liberar recursos." } else { "Sistema operando em zona segura." }
            ));
        }
        return Ok(format!(
            "RAM Technical Analysis:\n• Current Usage: {:.1}% ({:.1} GB free)\n• Top Consumer: '{}'\n• Diagnostic: {}. {}", 
            ram_pct, free_gb, p_name,
            if ram_pct > 80.0 { "Critical memory load detected" } else { "RAM health is excellent" },
            if ram_pct > 70.0 { "I suggest running Segatt Cleaner now to free up resources." } else { "System is operating within safe margins." }
        ));
    }

    // Performance / CPU / Lag
    if msg.contains("lento") || msg.contains("lag") || msg.contains("fps") || msg.contains("perf") || msg.contains("slow") {
        let cpu_pct = ctx.cpu_usage;
        if cpu_pct > 60.0 {
            if is_pt {
                return Ok(format!(
                    "Gargalo de CPU Identificado ({:.1}%):\nO sistema está sob carga pesada. Recomendo:\n1. Ativar o 'Plano de Desempenho Máximo' em Tweaks.\n2. Fechar o processo '{}' se não estiver em uso.", 
                    cpu_pct, ctx.top_processes[0].name
                ));
            }
            return Ok(format!(
                "CPU Bottleneck Identified ({:.1}%):\nSystem is under heavy load. I recommend:\n1. Enable 'High Performance Plan' in Tweaks.\n2. Terminate '{}' if not strictly necessary.", 
                cpu_pct, ctx.top_processes[0].name
            ));
        } else {
            if is_pt {
                return Ok(format!("Carga de CPU está normal ({:.1}%). Se você sente lentidão, pode ser latência de disco ou rede. Tente limpar o DNS no módulo Cleaner.", cpu_pct));
            }
            return Ok(format!("CPU load is normal ({:.1}%). If you experience lag, it might be disk or network latency. Try flushing DNS in the Cleaner module.", cpu_pct));
        }
    }

    // Windows / OS versions
    if msg.contains("windo") || msg.contains("versão") || msg.contains("version") || msg.contains("sistema") {
        if is_pt {
            return Ok(format!("Relatório do Windows: Você está no {} (Versão {}). O Segatt Tools está otimizado para este build. Já aplicou os ajustes de privacidade?", ctx.os_name, ctx.os_version));
        }
        return Ok(format!("Windows Report: Running {} (Version {}). Segatt Tools is optimized for this build. Have you applied privacy tweaks yet?", ctx.os_name, ctx.os_version));
    }

    // Diagnostic/Status
    if msg.contains("status") || msg.contains("diag") || msg.contains("check") {
        if is_pt { 
            return Ok(format!("Relatório de Saúde Segatt — OS: {} | RAM: {:.0}% | CPU: {:.1}%.\nSua máquina está {}, focada em performance gamer.", ctx.os_name, (ctx.used_memory as f32 / ctx.total_memory as f32) * 100.0, ctx.cpu_usage, if ctx.cpu_usage < 30.0 { "otimizada" } else { "em carga" }));
        }
        return Ok(format!("Segatt Health Report — OS: {} | RAM: {:.0}% | CPU: {:.1}%.\nYour machine is {}, focused on gaming performance.", ctx.os_name, (ctx.used_memory as f32 / ctx.total_memory as f32) * 100.0, ctx.cpu_usage, if ctx.cpu_usage < 30.0 { "optimized" } else { "under load" }));
    }

    // Default Greeting / Help
    if is_pt {
        return Ok("Olá! Sou a Inteligência da Segatt Tools. Posso analisar seu hardware em tempo real, identificar gargalos de CPU/RAM e sugerir ajustes específicos. Em que posso ajudar?".into());
    }
    Ok("Hello! I am Segatt Tools Intelligence. I can analyze your hardware in real-time, identify CPU/RAM bottlenecks, and suggest specific tweaks. How can I assist you?".into())
}
