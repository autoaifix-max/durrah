$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# Builds and tests locally only. This script does not publish or modify hosting.
$Project = (Resolve-Path $PSScriptRoot).Path
$LogDir = Join-Path $Project 'validation-logs'
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$Transcript = Join-Path $LogDir 'run.log'
Start-Transcript -Path $Transcript -Force | Out-Null

function Invoke-Step([string]$Name, [scriptblock]$Action) {
  Write-Host "`n===== $Name =====" -ForegroundColor Cyan
  & $Action
  if ($LASTEXITCODE -ne 0) { throw "$Name failed with exit code $LASTEXITCODE" }
}

try {
  Write-Host "Project: $Project"
  node --version
  npm --version
  if (-not (Get-Command python -ErrorAction SilentlyContinue)) { throw 'Python is missing. Install Python 3.11+ and enable Add to PATH.' }

  if (-not (Get-Command corepack -ErrorAction SilentlyContinue) -and -not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    throw 'Corepack/pnpm not found. Install a current Node.js LTS release, then rerun this script.'
  }
  if (Get-Command corepack -ErrorAction SilentlyContinue) {
    Invoke-Step 'Activate pnpm 10.18.0' { corepack prepare pnpm@10.18.0 --activate }
  }
  if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) { throw 'pnpm is not available after activation.' }

  Invoke-Step 'Install locked dependencies' { pnpm install --frozen-lockfile }
  Invoke-Step 'TypeScript check' { pnpm check }
  Invoke-Step 'Unit tests' { pnpm test }
  Invoke-Step 'Fresh static build' { pnpm build:static }

  Invoke-Step 'Install browser test dependency' { python -m pip install playwright }
  Invoke-Step 'Install WebKit and Chromium test browsers' { python -m playwright install webkit chromium }

  $env:PORT = '3017'
  $env:DEMO_TEST_ORIGIN = 'http://127.0.0.1:3017'
  $env:MENU_TEST_ORIGIN = 'http://127.0.0.1:3017'
  $env:DURRAT_TEST_OUTPUT = Join-Path $LogDir 'browser-artifacts'
  New-Item -ItemType Directory -Force -Path $env:DURRAT_TEST_OUTPUT | Out-Null
  $ServerOut = Join-Path $LogDir 'preview.stdout.log'
  $ServerErr = Join-Path $LogDir 'preview.stderr.log'
  $Server = Start-Process -FilePath 'node' -ArgumentList 'scripts/serve-preview.mjs' -WorkingDirectory $Project -PassThru -WindowStyle Hidden -RedirectStandardOutput $ServerOut -RedirectStandardError $ServerErr
  try {
    $Ready = $false
    for ($i=0; $i -lt 40; $i++) {
      Start-Sleep -Milliseconds 500
      try { $r = Invoke-WebRequest 'http://127.0.0.1:3017/menu/' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -eq 200) { $Ready = $true; break } } catch {}
    }
    if (-not $Ready) { throw 'Local preview did not become ready. Check preview logs.' }
    Invoke-Step 'Full demo order journey on WebKit and Chromium' { python scripts/test-demo.py }
    Invoke-Step 'Menu and mobile interactions on WebKit and Chromium' { python scripts/test-menu-mobile.py }
    Invoke-Step 'Mobile regression suite' { python scripts/test-mobile.py http://127.0.0.1:3017 }
  }
  finally {
    if ($Server -and -not $Server.HasExited) { Stop-Process -Id $Server.Id -Force }
  }
  Write-Host "`nALL CHECKS PASSED. Logs: $LogDir" -ForegroundColor Green
}
catch {
  Write-Host "`nVALIDATION STOPPED: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "Read logs: $Transcript"
  exit 1
}
finally {
  Stop-Transcript | Out-Null
}
