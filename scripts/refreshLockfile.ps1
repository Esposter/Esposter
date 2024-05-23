Remove-Item "pnpm-lock.yaml"
Get-ChildItem -Filter "node_modules" -Recurse -Force | Remove-Item -Recurse -Force
Invoke-Expression "pnpm i"