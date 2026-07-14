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
