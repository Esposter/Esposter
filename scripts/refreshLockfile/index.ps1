# Kill node processes first - on Windows a running process locks native .node
# binaries, so rmdir /s /q below fails "Access is denied" while dev/vitest/tsserver
# hold them open. (Not needed on Linux, where rm -rf unlinks open files fine.)
#
# Two filters, and both are load-bearing. Only processes whose command line names
# this workspace are candidates: a host-wide `node.exe` sweep would take down every
# unrelated editor server, dev server and agent session on the machine, and the ones
# holding a lock here are by definition running something out of this tree. Missing a
# locker is the cheap direction to be wrong in - rmdir then fails loudly with "Access
# is denied" and the run is repeatable; killing a stranger's process is not.
# Then skip our own ancestry: pnpm runs this script through node from inside the
# workspace, so it matches the first filter and would terminate the refresh mid-run.
$workspacePath = (Resolve-Path (Join-Path $PSScriptRoot "../..")).Path
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
  Where-Object {
    # IndexOf with an explicit comparison rather than -like: Windows paths are
    # case-insensitive, and a -like pattern would read a bracket in the path as a
    # character class. The trailing separator is the path boundary - a bare substring
    # match also matches a sibling workspace whose path extends this one, so a
    # neighbouring checkout's node processes would be killed too. Both separators,
    # because node reports its own argv paths with either.
    $commandLine = $_.CommandLine
    $_.Name -eq "node.exe" -and $commandLine -and
    ($commandLine.IndexOf("$workspacePath\", [System.StringComparison]::OrdinalIgnoreCase) -ge 0 -or
      $commandLine.IndexOf("$workspacePath/", [System.StringComparison]::OrdinalIgnoreCase) -ge 0) -and
    -not $ancestors.Contains([int]$_.ProcessId)
  } |
  ForEach-Object { taskkill /F /PID $_.ProcessId 2>$null }

# A removal that silently fails leaves stale state that the pnpm i below then installs
# on top of, which is the failure this script exists to clear. Only an already-absent
# lockfile is not an error.
if (Test-Path "pnpm-lock.yaml") { Remove-Item "pnpm-lock.yaml" -Force -ErrorAction Stop }
# Collect every node_modules at any depth, but prune (don't descend into) a matched
# node_modules so we never walk the huge .pnpm tree. Mirrors `find -prune` in the
# sh script. rmdir /s /q handles pnpm junctions + long paths, which
# Remove-Item -Recurse chokes on ("directory not empty").
function Get-NodeModules($path) {
  # Reparse points are skipped rather than followed: a junction or symlink leads out of
  # the workspace, and everything this returns is handed to rmdir /s /q.
  foreach ($dir in Get-ChildItem -Path $path -Directory -Force) {
    if ($dir.Attributes.HasFlag([System.IO.FileAttributes]::ReparsePoint)) { continue }
    if ($dir.Name -eq "node_modules") { $dir.FullName }
    else { Get-NodeModules $dir.FullName }
  }
}

$targets = @(Get-NodeModules ".")
for ($i = 0; $i -lt $targets.Count; $i++) {
  $dir = $targets[$i]
  Write-Progress -Activity "Removing node_modules" -Status "$($i + 1)/$($targets.Count): $dir" -PercentComplete (($i + 1) / $targets.Count * 100)
  cmd /c "rmdir /s /q `"$dir`""
  if ($LASTEXITCODE -ne 0) { throw "rmdir exited $LASTEXITCODE for $dir" }
}
Write-Progress -Activity "Removing node_modules" -Completed

pnpm i
