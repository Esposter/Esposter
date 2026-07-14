# Free native .node bindings first - on Windows a process that has LoadLibrary'd a
# .node DLL locks the file, so rmdir /s /q below fails "Access is denied". Filtering
# by process name (e.g. node.exe) is wrong both ways: it misses Electron-hosted
# language servers that load our bindings under their app's exe name (Code.exe,
# "Antigravity IDE.exe", ...), and it needlessly kills unrelated node.exe processes
# from other repos. Instead ask Windows which processes actually have a module loaded
# from THIS repo's node_modules - precise and name-agnostic. (Not needed on Linux,
# where rm -rf unlinks open files fine.)
$repoRoot = (Resolve-Path ".").Path.TrimEnd("\") + "\"
$nodeModulesPrefix = $repoRoot + "node_modules\"

# Skip our own ancestry: pnpm runs this script through node, so killing an ancestor
# would terminate the refresh mid-run. Walk up from $PID collecting ancestor PIDs.
$processMap = @{}
foreach ($process in Get-CimInstance Win32_Process) { $processMap[[int]$process.ProcessId] = $process }
$ancestors = [System.Collections.Generic.HashSet[int]]::new()
$currentId = $PID
# $ancestors.Add returns false on a repeat, which also breaks the loop if PID reuse
# has made the snapshot's parent chain cyclic.
while ($currentId -and $processMap.ContainsKey($currentId) -and $ancestors.Add($currentId)) {
  $currentId = [int]$processMap[$currentId].ParentProcessId
}

$windowedHolders = [System.Collections.Generic.List[string]]::new()
foreach ($process in Get-Process) {
  if ($ancestors.Contains($process.Id)) { continue }
  # .Modules throws for processes we can't open (other users / system); skip those.
  try { $modules = $process.Modules } catch { continue }
  if (-not ($modules | Where-Object { $_.FileName -like "$nodeModulesPrefix*" })) { continue }
  $label = "$($process.ProcessName) ($($process.Id))"
  # A windowless holder is a background server (language server, dev server, vitest)
  # that respawns on demand - safe to kill. A windowed holder is an app main process
  # with possibly-unsaved work; report it and let the user close it themselves.
  if ($process.MainWindowHandle -eq 0) {
    Write-Host "[kill] $label"
    taskkill /F /PID $process.Id 2>$null
  } else {
    $windowedHolders.Add($label)
  }
}
if ($windowedHolders.Count) {
  throw "These windowed apps hold a lock in node_modules - close them and retry:`n  $($windowedHolders -join "`n  ")"
}

Remove-Item "pnpm-lock.yaml" -Force -ErrorAction SilentlyContinue
# Collect every node_modules at any depth, but prune (don't descend into) a matched
# node_modules so we never walk the huge .pnpm tree. Mirrors `find -prune` in the
# sh script. rmdir /s /q handles pnpm junctions + long paths, which
# Remove-Item -Recurse chokes on ("directory not empty").
function Get-NodeModules($path) {
  foreach ($dir in Get-ChildItem -Path $path -Directory -Force) {
    if ($dir.Name -eq "node_modules") { $dir.FullName }
    else { Get-NodeModules $dir.FullName }
  }
}

$targets = @(Get-NodeModules ".")
for ($i = 0; $i -lt $targets.Count; $i++) {
  $dir = $targets[$i]
  Write-Progress -Activity "Removing node_modules" -Status "$($i + 1)/$($targets.Count): $dir" -PercentComplete (($i + 1) / $targets.Count * 100)
  cmd /c "rmdir /s /q `"$dir`""
}
Write-Progress -Activity "Removing node_modules" -Completed

pnpm i
