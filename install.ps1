# 🪐 Segatt Tools - PowerShell Installer
# Este script faz o download e executa o instalador mais recente do Segatt Tools

$ErrorActionPreference = "Stop"

# Configurações
$repoUrl = "https://api.github.com/repos/joshsegatt/Segatt-Tools/releases/latest"
$tempPath = "$env:TEMP\segatt_setup.exe"

Write-Host "`n🪐 Iniciando Instalação: Segatt Tools Elite Utility" -ForegroundColor Cyan
Write-Host "----------------------------------------------------" -ForegroundColor Gray

try {
    # 1. Buscar a URL de download do Release mais recente
    Write-Host "🔍 Buscando versão mais recente no GitHub..." -ForegroundColor Gray
    $release = Invoke-RestMethod -Uri $repoUrl
    $asset = $release.assets | Where-Object { $_.name -like "*-setup.exe" } | Select-Object -First 1
    
    if (-not $asset) {
        Write-Error "Erro: Não foi possível encontrar o instalador .exe no GitHub Releases."
    }

    $downloadUrl = $asset.browser_download_url
    $version = $release.tag_name

    Write-Host "📦 Baixando Segatt Tools $version..." -ForegroundColor Gray
    
    # 2. Fazer o download do arquivo
    Invoke-WebRequest -Uri $downloadUrl -OutFile $tempPath

    # 3. Executar o instalador
    Write-Host "🚀 Iniciando instalador..." -ForegroundColor Green
    Start-Process -FilePath $tempPath -Wait

    Write-Host "`n✅ Segatt Tools instalado com sucesso!" -ForegroundColor Cyan
}
catch {
    Write-Host "`n❌ Erro durante a instalação: $($_.Exception.Message)" -ForegroundColor Red
}
finally {
    if (Test-Path $tempPath) { Remove-Item $tempPath -Force }
}
