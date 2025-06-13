Remove-Item "bun.lock"
Get-ChildItem -Filter "node_modules" -Recurse -Force | Remove-Item -Recurse -Force
Invoke-Expression "bun --bun i"