# 🪐 Segatt Tools - Instant PowerShell Runner
# Inspirado no CTT Tools - Download e Execução Instantânea

$ErrorActionPreference = "Stop"

# Configurações do Repositório Oficial
$repoUrl = "https://api.github.com/repos/joshsegatt/Segatt-Tools/releases/latest"
$tempPath = "$env:TEMP\SegattTools.exe"

Write-Host "`n🪐 Abrindo Segatt Tools Elite Utility..." -ForegroundColor Cyan
Write-Host "----------------------------------------------------" -ForegroundColor Gray

try {
    # 1. Buscar a versão portátil (Portable.exe)
    $release = Invoke-RestMethod -Uri $repoUrl
    $asset = $release.assets | Where-Object { $_.name -like "*Portable.exe" } | Select-Object -First 1
    
    if (-not $asset) {
        Write-Host "⚠️ Versão portátil não encontrada. Buscando instalador padrão..." -ForegroundColor Yellow
        $asset = $release.assets | Where-Object { $_.name -like "*-setup.exe" } | Select-Object -First 1
    }

    $downloadUrl = $asset.browser_download_url
    Write-Host "📦 Carregando módulos do sistema..." -ForegroundColor Gray
    
    # 2. Download e Execução
    Invoke-WebRequest -Uri $downloadUrl -OutFile $tempPath
    
    Write-Host "🚀 Iniciando..." -ForegroundColor Green
    Start-Process -FilePath $tempPath
}
catch {
    Write-Host "`n❌ Erro ao abrir a ferramenta: $($_.Exception.Message)" -ForegroundColor Red
}
