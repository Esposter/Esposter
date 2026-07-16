param([string]$new, [string]$old)

# If the caller's shell enabled fnm's built-in corepack support (FNM_COREPACK_ENABLED, set by
# `fnm env --corepack-enabled`), fnm runs `corepack enable` on every install/use/default. Node 25+ no
# longer bundles corepack, so that fires against a binary this fresh version doesn't have yet and hard-errors
# ("Can't enable corepack: Can't spawn program"). Suppress it here and let the block below provision corepack
# ourselves; once it's globally installed, the user's cd-triggered `fnm use --corepack-enabled` resolves fine.
Remove-Item Env:FNM_COREPACK_ENABLED -ErrorAction SilentlyContinue

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
# Remove the previous node version if it changed. fnm can't delete a version whose node.exe is still open on
# Windows, so if this call's own node processes still hold $old the synchronous uninstall fails; a detached
# process then retries until they exit. Best-effort - a still-locked version is harmless and removable later.
# We only touch $old, never other installed versions the user may keep for different projects.
if ($old -and $old -ne $new) {
  fnm uninstall $old 2>$null
  if ($LASTEXITCODE -ne 0) {
    $retry = "for (`$i = 0; `$i -lt 60; `$i++) { fnm uninstall $old 2>`$null; if (`$LASTEXITCODE -eq 0) { break }; Start-Sleep 1 }"
    Start-Process pwsh -WindowStyle Hidden -ArgumentList "-NoProfile", "-NonInteractive", "-Command", $retry
    Write-Output "Scheduled removal of node $old (runs once this process exits)."
  }
}
