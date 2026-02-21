# Install Foundry locally into contracts/.foundry/bin (Windows).
# Run once from contracts/. Then use .\deploy.ps1
# Optional: -Force to re-download and re-extract.
param([switch]$Force)

Set-Location $PSScriptRoot
$binDir = Join-Path $PSScriptRoot ".foundry\bin"
$forgeExe = Join-Path $binDir "forge.exe"

if ((Test-Path $forgeExe) -and -not $Force) {
    Write-Host "Foundry already installed at $binDir. Use -Force to re-download."
    & $forgeExe --version
    exit 0
}

$version = "v1.5.4"
$zipUrl = "https://github.com/foundry-rs/foundry/releases/download/$version/foundry_$version`_win32_amd64.zip"
$zipPath = Join-Path $PSScriptRoot "foundry_win32_amd64.zip"

Write-Host "Downloading Foundry $version..."
try {
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing
} catch {
    Write-Host "Trying latest release..."
    $version = "v1.6.0-rc1"
    $zipUrl = "https://github.com/foundry-rs/foundry/releases/download/$version/foundry_$version`_win32_amd64.zip"
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing
}

if (-not (Test-Path $zipPath)) {
    Write-Error "Download failed."
    exit 1
}

$tempExtract = Join-Path $PSScriptRoot ".foundry_temp"
New-Item -ItemType Directory -Path $tempExtract -Force | Out-Null
Write-Host "Extracting..."
Expand-Archive -Path $zipPath -DestinationPath $tempExtract -Force
Remove-Item $zipPath -Force -ErrorAction SilentlyContinue

New-Item -ItemType Directory -Path $binDir -Force | Out-Null
if (Test-Path (Join-Path $tempExtract "forge.exe")) {
    Get-ChildItem $tempExtract -Filter "*.exe" -File | ForEach-Object { Move-Item $_.FullName -Destination $binDir -Force }
} else {
    $sub = Get-ChildItem $tempExtract -Directory | Select-Object -First 1
    if ($sub) {
        Get-ChildItem $sub.FullName -File | Move-Item -Destination $binDir -Force
    }
}
Remove-Item $tempExtract -Recurse -Force -ErrorAction SilentlyContinue

if (-not (Test-Path $forgeExe)) {
    Write-Error "forge.exe not found after extract. Check ZIP layout."
    exit 1
}

Write-Host "Installing forge-std..."
if (-not (Test-Path (Join-Path $PSScriptRoot ".git"))) {
    git init 2>$null
}
& $forgeExe install foundry-rs/forge-std
if ($LASTEXITCODE -ne 0) {
    Write-Warning "forge install forge-std had issues. Run: & '$forgeExe' install foundry-rs/forge-std"
}

Write-Host "Done. Foundry is at $binDir"
& $forgeExe --version
