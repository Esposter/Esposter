// Wraps `command` so it runs inside the user's real WSL login + interactive shell — the same shell a terminal opens,
// Where a profile/rc-bound version manager (fnm, nvm, asdf, volta) has put node on PATH. -i is required, not just
// -l: zsh/bash only source the interactive rc (~/.zshrc, ~/.bashrc) — where the activation lives — when interactive.
// Resolve the user's own login shell ($SHELL, then the passwd entry, then /bin/sh) so the right rc is sourced, then
// Exec it with the command. `command` must be safe to embed in single quotes (no single quotes of its own). Shared by
// ReadWslLoginPath (captures the resulting PATH) and the sandbox-install gate (probes that node + corepack resolve),
// So the gate matches exactly the toolchain the backend can reach rather than a bare non-interactive PATH.
export const buildWslLoginShellCommand = (command: string): string =>
  [
    // oxlint-disable-next-line no-template-curly-in-string -- `${SHELL:-}` is shell parameter expansion, not a JS template placeholder
    'SHELL_BIN="${SHELL:-}"',
    '[ -x "$SHELL_BIN" ] || SHELL_BIN="$(getent passwd "$(id -un)" 2>/dev/null | cut -d: -f7)"',
    '[ -x "$SHELL_BIN" ] || SHELL_BIN=/bin/sh',
    `exec "$SHELL_BIN" -lic '${command}'`,
  ].join("; ");
