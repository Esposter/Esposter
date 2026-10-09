# Keeps one typecheck watcher alive per package a wave edits, each writing its passes to ~/Esposter/checks/<name>.log
# A watcher found dead, or whose latest pass shows TS6307 (its watch never adds a file created after it started), is
# Started again with its build info deleted
# Start it once, hidden; stop it by killing its process when the wave ends
param(
  [string[]]$Packages = @("scripts", "packages/genshin-world", "packages/genshin-interface"),
  [int]$IntervalSeconds = 30
)

$root = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)))
$logs = Join-Path $env:USERPROFILE "Esposter\checks"
New-Item -ItemType Directory -Force $logs | Out-Null

while ($true) {
  $rebuilt = [System.Collections.Generic.HashSet[string]]::new()
  $running = Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -match "tsc" -and $_.CommandLine -match "--watch" }
  foreach ($package in $Packages) {
    # Normalized to the separators a watcher's command line carries, or a live watcher is never matched
    $directory = [System.IO.Path]::GetFullPath((Join-Path $root $package))
    $name = Split-Path -Leaf $package
    $isAlive = $running | Where-Object { $_.CommandLine -match [regex]::Escape((Join-Path $directory "node_modules")) }
    $log = Join-Path $logs "$name.log"
    if ($isAlive) {
      $lastPass = if (Test-Path $log) { ((Get-Content $log -Raw) -split "Starting (?:incremental )?compilation")[-1] } else { "" }
      # A sibling package that gained a module file since its index was last generated reads as a missing export here,
      # Since the generated index is untracked and a sync never rebuilds it; that package is rebuilt once, never this watcher
      foreach ($match in [regex]::Matches($lastPass, 'Module ''"(genshin-[a-z]+)"'' has no exported member')) {
        $stale = Join-Path $root "packages/$($match.Groups[1].Value)"
        if ((Test-Path $stale) -and -not $rebuilt.Contains($stale)) {
          [void]$rebuilt.Add($stale)
          Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "pnpm exec tsdown --no-clean" -WorkingDirectory $stale -WindowStyle Hidden -Wait | Out-Null
          Write-Output ("{0:HH:mm:ss} rebuilt {1}'s index, which {2} read as missing an export" -f (Get-Date), $match.Groups[1].Value, $name)
        }
      }
      if ($lastPass -notmatch "error TS6307") { continue }
      foreach ($process in $isAlive) {
        # The parent is stopped only while it is still the pnpm launcher this keeper started, never a reused PID
        $parent = Get-CimInstance Win32_Process -Filter "ProcessId=$($process.ParentProcessId)" -ErrorAction SilentlyContinue
        Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
        if ($parent -and $parent.CommandLine -match "pnpm" -and $parent.CommandLine -match "--watch") { Stop-Process -Id $parent.ProcessId -Force -ErrorAction SilentlyContinue }
      }
      Write-Output ("{0:HH:mm:ss} restarting the {1} watcher, its file list stale" -f (Get-Date), $name)
    }
    $compiler = if (Get-ChildItem -Path (Join-Path $directory "src") -Recurse -Filter "*.vue" -ErrorAction SilentlyContinue | Select-Object -First 1) { "vue-tsc" } else { "tsc" }
    Remove-Item (Join-Path $directory "tsconfig.tsbuildinfo") -ErrorAction SilentlyContinue
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "pnpm exec $compiler --noEmit --watch --preserveWatchOutput > `"$log`" 2>&1" -WorkingDirectory $directory -WindowStyle Hidden | Out-Null
    Write-Output ("{0:HH:mm:ss} started the {1} watcher" -f (Get-Date), $name)
  }
  Start-Sleep -Seconds $IntervalSeconds
}
