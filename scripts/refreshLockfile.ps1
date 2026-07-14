Remove-Item "pnpm-lock.yaml" -Force -ErrorAction SilentlyContinue
# Find every node_modules at any depth, but prune (don't descend into) a matched
# node_modules so we never walk the huge .pnpm tree. Mirrors `find -prune` in the
# sh script. rmdir /s /q handles pnpm junctions + long paths, which
# Remove-Item -Recurse chokes on ("directory not empty").
function Remove-NodeModules($path) {
  foreach ($dir in Get-ChildItem -Path $path -Directory -Force) {
    if ($dir.Name -eq "node_modules") {
      cmd /c "rmdir /s /q `"$($dir.FullName)`""
    } else {
      Remove-NodeModules $dir.FullName
    }
  }
}

Remove-NodeModules "."

pnpm i
