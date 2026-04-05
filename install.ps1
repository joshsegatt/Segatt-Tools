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
        $asset = $release.assets | Where-Object { $_.name -like "*-setup.exe" -or $_.name -like "*_x64_*.exe" -or $_.name -like "*.msi" } | Select-Object -First 1
    }

    if (-not $asset -and $release.assets.Count -gt 0) {
        Write-Host "🔍 Buscando qualquer instalador disponível..." -ForegroundColor Cyan
        $asset = $release.assets | Where-Object { $_.name -like "*.exe" -or $_.name -like "*.msi" } | Select-Object -First 1
    }
    
    if (-not $asset) {
        throw "Nenhum instalador encontrado na release $($release.tag_name). Verifique o repositório GitHub."
    }

    $downloadUrl = $asset.browser_download_url
    Write-Host "📦 Arquivo encontrado: $($asset.name)" -ForegroundColor Gray
    Write-Host "📦 Carregando módulos do sistema..." -ForegroundColor Gray
    
    # 2. Download e Execução
    Invoke-WebRequest -Uri $downloadUrl -OutFile $tempPath
    
    Write-Host "🚀 Iniciando..." -ForegroundColor Green
    Start-Process -FilePath $tempPath
}
catch {
    Write-Host "`n❌ Erro ao abrir a ferramenta: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Tente baixar manualmente em: https://github.com/joshsegatt/Segatt-Tools/releases" -ForegroundColor Gray
}
