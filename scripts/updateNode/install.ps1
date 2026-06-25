param([string]$new, [string]$old)

fnm install $new
fnm default $new
fnm use $new
# A freshly installed node has corepack disabled (and future node releases may not bundle it), so pnpm
# is unavailable until we turn it on. Ensure corepack exists, then enable its package-manager shims.
if (-not (Get-Command corepack -ErrorAction SilentlyContinue)) {
  npm install -g corepack
}
corepack enable
# The old version's directory is locked while this updater's node processes are alive (fnm refuses to
# delete an in-use version on Windows). Launch a detached, hidden process that retries `fnm uninstall`
# until the lock clears — i.e. once this call's node processes exit. Self-cleaning, no process killing.
if ($old -and $old -ne $new) {
  $retry = "for (`$i = 0; `$i -lt 60; `$i++) { fnm uninstall $old 2>`$null; if (`$LASTEXITCODE -eq 0) { break }; Start-Sleep 1 }"
  Start-Process pwsh -WindowStyle Hidden -ArgumentList "-NoProfile", "-NonInteractive", "-Command", $retry
  Write-Output "Scheduled removal of node $old (runs once this process exits)."
}
