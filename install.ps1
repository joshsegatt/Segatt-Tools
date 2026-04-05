# 🪐 Segatt Tools - Instant PowerShell Runner
# Inspirado no CTT Tools - Download e Execução Instantânea

# 0. Configurações de Segurança e Ambiente
$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Verificar se está como Administrador
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

# Configurações do Repositório Oficial
$repoUrl = "https://api.github.com/repos/joshsegatt/Segatt-Tools/releases/latest"

# 1. Buscar o release e escolher o melhor asset
$release = Invoke-RestMethod -Uri $repoUrl
$version = $release.tag_name

Write-Host "`n🪐 Abrindo Segatt Tools Elite Utility ($version)..." -ForegroundColor Cyan
Write-Host "----------------------------------------------------" -ForegroundColor Gray

if (-not $isAdmin) {
    Write-Host "⚠️  DICA: Execute o PowerShell como ADMINISTRADOR para melhores resultados." -ForegroundColor Yellow
}

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

    # Definir caminho temporário único para evitar erro de 'arquivo em uso'
    $extension = [System.IO.Path]::GetExtension($asset.name)
    $tempName = "SegattTools_" + (Get-Date -Format "yyyyMMdd_HHmmss") + $extension
    $tempPath = Join-Path $env:TEMP $tempName

    $downloadUrl = $asset.browser_download_url
    Write-Host "📦 Arquivo encontrado: $($asset.name)" -ForegroundColor Gray
    Write-Host "📦 Carregando módulos do sistema..." -ForegroundColor Gray
    
    # 2. Download e Execução
    Invoke-WebRequest -Uri $downloadUrl -OutFile $tempPath
    
    Write-Host "🚀 Iniciando $($asset.name)..." -ForegroundColor Green
    if ($extension -eq ".msi") {
        Start-Process msiexec.exe -ArgumentList "/i `"$tempPath`"" -Wait
    } else {
        Start-Process -FilePath $tempPath
    }
}
catch {
    Write-Host "`n❌ Erro ao abrir a ferramenta: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Tente baixar manualmente em: https://github.com/joshsegatt/Segatt-Tools/releases" -ForegroundColor Gray
}
