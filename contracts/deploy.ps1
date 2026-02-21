# Load .env and run Foundry build, test, deploy.
# Requires: run .\install-foundry.ps1 once, or forge in PATH
Set-Location $PSScriptRoot

if (Test-Path .env) { $envFile = ".env" }
elseif (Test-Path (Join-Path $PSScriptRoot "..\.env")) { $envFile = (Join-Path $PSScriptRoot "..\.env"); Write-Host "Using root .env" }
elseif (Test-Path .env.example) { $envFile = ".env.example"; Write-Host "Using .env.example (copy to .env to keep secrets out of version control)" }
else {
    Write-Error "Create a .env file with ARC_TESTNET_RPC_URL and PRIVATE_KEY (in this folder or project root). See .env.example"
    exit 1
}

Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $val = $matches[2].Trim().Trim('"').Trim("'")
        if ($key -eq "PRIVATE_KEY" -and $val -and -not $val.StartsWith("0x")) { $val = "0x" + $val }
        [Environment]::SetEnvironmentVariable($key, $val, 'Process')
    }
}

$rpc = $env:ARC_TESTNET_RPC_URL
$pk = $env:PRIVATE_KEY
if (-not $rpc -or -not $pk) {
    Write-Error "Set ARC_TESTNET_RPC_URL and PRIVATE_KEY in your .env (found: $envFile). Current .env has keys: $((Get-Content $envFile | ForEach-Object { if ($_ -match '^\s*([^#][^=]+)=') { $matches[1].Trim() } }) -join ', ')"
    exit 1
}
Write-Host "Env OK: ARC_TESTNET_RPC_URL and PRIVATE_KEY set."

$forgeCmd = $null
$localForge = Join-Path $PSScriptRoot ".foundry\bin\forge.exe"
if (Test-Path $localForge) { $forgeCmd = $localForge }
elseif (Get-Command forge -ErrorAction SilentlyContinue) { $forgeCmd = "forge" }
elseif (Test-Path "$env:USERPROFILE\.foundry\bin\forge.exe") { $forgeCmd = "$env:USERPROFILE\.foundry\bin\forge.exe" }
if (-not $forgeCmd) {
    Write-Error "forge not found. Run .\install-foundry.ps1 first (or install Foundry from https://getfoundry.sh)."
    exit 1
}

Write-Host "Building..."
& $forgeCmd build
if ($LASTEXITCODE -ne 0) {
    Write-Error "forge build failed. Run: forge install foundry-rs/forge-std --no-commit"
    exit 1
}

Write-Host "Running tests..."
& $forgeCmd test
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Deploying to Arc Testnet..."
$out = & $forgeCmd script script/Deploy.s.sol:DeployScript --rpc-url $rpc --private-key $pk --broadcast 2>&1
$out | ForEach-Object { Write-Host $_ }

$addr = ($out | Select-String "DomainLease deployed at:\s*(0x[a-fA-F0-9]{40})").Matches.Groups[1].Value
if ($addr -and $addr.Length -gt 0) {
    Write-Host ""
    Write-Host "Deployed at: $addr"
    $appEnv = Join-Path (Split-Path $PSScriptRoot -Parent) "app\.env.local"
    $line = "NEXT_PUBLIC_DOMAIN_LEASE_ADDRESS=$addr"
    if (Test-Path $appEnv) {
        $content = Get-Content $appEnv -Raw
        if ($content -match "NEXT_PUBLIC_DOMAIN_LEASE_ADDRESS=") {
            $content = $content -replace "NEXT_PUBLIC_DOMAIN_LEASE_ADDRESS=.*", $line
        } else { $content = $content.TrimEnd() + "`n$line`n" }
        Set-Content $appEnv $content -NoNewline
    } else {
        Set-Content $appEnv $line
    }
    Write-Host "Updated $appEnv for the Next.js app."
}
