import { WSL_EXECUTABLE, WSL_REAPER_SHELL_NAME } from "#src/services/exec/wsl/constants";
// Build the argv for a reaper: a fresh `wsl.exe --exec` that finds each named run's shell by its unique `$0` marker
// (createWslProcessMarker) and kills that shell's entire process group. Group kill is what a terminal does for
// Ctrl+C — it reaches the host-side `bwrap` (collapsing its PID namespace, so the sandboxed command dies mid-run) as
// Well as the shell, leaving nothing orphaned to wedge the next run. Two callers hand it different sets: the
// Interrupted run itself passes its own marker (createWslOsBackend's onTerminate), and the startup sweep passes every
// Marker whose owning host process is dead (reapOrphanedWslRuns) — one `wsl.exe` launch for the whole set, since a
// Launch is a service RPC plus a relay process.
//
// The markers ride the argv rather than the script text so a set of any size needs no quoting rules. That does put
// Every marker in this reaper's own cmdline, which its `pgrep` then matches: `self=$$` excludes this shell, and two
// Reapers that were handed the same marker can match each other — harmless, since they are doing the same work and
// Whichever survives finishes it. The `-p`/`2>/dev/null` guards keep a race where a matched process already exited
// From turning into noise. TERM (not KILL) so bwrap can unwind cleanly.
export const buildWslReapCommand = (markers: readonly string[]): [string, ...string[]] => {
  const script = [
    "self=$$",
    'for marker in "$@"; do',
    '  for pid in $(pgrep -f "$marker" 2>/dev/null); do',
    '    [ "$pid" = "$self" ] && continue',
    '    pgid=$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d " ")',
    '    [ -n "$pgid" ] && kill -TERM "-$pgid" 2>/dev/null',
    "  done",
    "done",
  ].join("\n");
  return [WSL_EXECUTABLE, "--exec", "sh", "-c", script, WSL_REAPER_SHELL_NAME, ...markers];
};
