# Keeps one typecheck watcher alive per package a wave edits, each writing its passes to ~/Esposter/checks/<name>.log
# A watcher found dead is started again with its build info deleted, since a stale one hides new files (TS6307)
# Start it once, hidden; stop it by killing its process when the wave ends
param(
  [string[]]$Packages = @("scripts", "packages/genshin-world", "packages/genshin-interface"),
  [int]$IntervalSeconds = 30
)

$root = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)))
$logs = Join-Path $env:USERPROFILE "Esposter\checks"
New-Item -ItemType Directory -Force $logs | Out-Null

while ($true) {
  $running = Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -match "tsc" -and $_.CommandLine -match "--watch" }
  foreach ($package in $Packages) {
    $directory = Join-Path $root $package
    $name = Split-Path -Leaf $package
    $isAlive = $running | Where-Object { $_.CommandLine -match [regex]::Escape((Join-Path $directory "node_modules")) }
    if ($isAlive) { continue }
    $compiler = if (Get-ChildItem -Path (Join-Path $directory "src") -Recurse -Filter "*.vue" -ErrorAction SilentlyContinue | Select-Object -First 1) { "vue-tsc" } else { "tsc" }
    Remove-Item (Join-Path $directory "tsconfig.tsbuildinfo") -ErrorAction SilentlyContinue
    $log = Join-Path $logs "$name.log"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "pnpm exec $compiler --noEmit --watch --preserveWatchOutput > `"$log`" 2>&1" -WorkingDirectory $directory -WindowStyle Hidden | Out-Null
    Write-Output ("{0:HH:mm:ss} started the {1} watcher" -f (Get-Date), $name)
  }
  Start-Sleep -Seconds $IntervalSeconds
}
