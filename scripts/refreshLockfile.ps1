# Kill node processes first — on Windows a running process locks native .node
# binaries, so rmdir /s /q below fails "Access is denied" while dev/vitest/tsserver
# hold them open. (Not needed on Linux, where rm -rf unlinks open files fine.)
# Skip our own ancestry: pnpm runs this script through node, so a blanket
# `taskkill /IM node.exe` would terminate the refresh mid-run. Walk up from $PID,
# collect ancestor PIDs, and kill every other node.exe by PID.
$processMap = @{}
foreach ($process in Get-CimInstance Win32_Process) { $processMap[[int]$process.ProcessId] = $process }
$ancestors = [System.Collections.Generic.HashSet[int]]::new()
$currentId = $PID
# $ancestors.Add returns false on a repeat, which also breaks the loop if PID reuse
# has made the snapshot's parent chain cyclic.
while ($currentId -and $processMap.ContainsKey($currentId) -and $ancestors.Add($currentId)) {
  $currentId = [int]$processMap[$currentId].ParentProcessId
}
$processMap.Values |
  Where-Object { $_.Name -eq "node.exe" -and -not $ancestors.Contains([int]$_.ProcessId) } |
  ForEach-Object { taskkill /F /PID $_.ProcessId 2>$null }

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
