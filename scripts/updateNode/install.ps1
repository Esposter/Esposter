param([string]$new, [string]$old)

fnm install $new
fnm default $new
fnm use $new
# A freshly installed node has corepack disabled, and Node 25+ no longer bundles corepack at all, so pnpm
# is unavailable until we provide and enable it. This script runs in a nested non-interactive shell where
# `fnm use` can't rewrite PATH, so we can't trust ambient `corepack`/`npm` (they resolve to the OLD version).
# Resolve the NEW version's bin dir straight from its node binary (fnm exec can spawn node.exe but not the
# .cmd shims) and invoke corepack/npm there by absolute path.
$binDir = Split-Path (fnm exec --using $new -- node -e "process.stdout.write(process.execPath)")
$corepack = Join-Path $binDir "corepack.cmd"
if (-not (Test-Path $corepack)) {
  & (Join-Path $binDir "npm.cmd") install -g corepack
}
& $corepack enable
# Sweep leftover node versions. fnm can't delete a version whose node.exe is still open on Windows, so a
# long-lived process (editor / agent / dev server) started on an old version keeps it locked for the whole
# session. So we (1) immediately prune every installed version except the new one - this frees any version
# stranded by a PAST update whose processes have since exited - and (2) briefly retry the just-replaced $old
# in the background for the case where this call's own short-lived node processes release it moments later.
# Anything still locked is collected on the NEXT update run. Best-effort throughout; locked versions fail
# harmlessly.
$installed = [regex]::Matches((fnm list), 'v\d+\.\d+\.\d+') | ForEach-Object { $_.Value } | Select-Object -Unique
foreach ($v in $installed) { if ($v -ne "v$new") { fnm uninstall $v 2>$null } }
if ($old -and $old -ne $new) {
  $retry = "for (`$i = 0; `$i -lt 60; `$i++) { fnm uninstall $old 2>`$null; if (`$LASTEXITCODE -eq 0) { break }; Start-Sleep 1 }"
  Start-Process pwsh -WindowStyle Hidden -ArgumentList "-NoProfile", "-NonInteractive", "-Command", $retry
  Write-Output "Scheduled removal of node $old (runs once this process exits)."
}
