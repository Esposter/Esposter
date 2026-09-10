import { WSL_REAP_WAIT_INTERVAL_SECONDS, WSL_REAP_WAIT_TIMEOUT_SECONDS } from "#src/services/exec/util/constants";
import { WSL_EXECUTABLE, WSL_REAPER_SHELL_NAME } from "#src/services/exec/wsl/constants";
// Group-kill every named run: find its shell by the unique `$0` marker (createWslProcessMarker) and TERM that
// Shell's whole process group, which is what a terminal does for Ctrl+C — it reaches the host-side `bwrap` (collapsing
// Its PID namespace, so the sandboxed command dies mid-run) as well as the shell, leaving nothing orphaned to wedge
// The next run. The `-p`/`2>/dev/null` guards keep a race where a matched process already exited from turning into
// Noise. TERM (not KILL) so bwrap can unwind cleanly. Each killed group is remembered in `pgids` for the wait arm
// Below; the kill itself needs nothing of it, and one variable costs a fire-and-forget reaper nothing.
const KILL_SCRIPT_LINES: readonly string[] = [
  "self=$$",
  "pgids=",
  'for marker in "$@"; do',
  '  for pid in $(pgrep -f "$marker" 2>/dev/null); do',
  '    [ "$pid" = "$self" ] && continue',
  '    pgid=$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d " ")',
  '    [ -n "$pgid" ] || continue',
  '    kill -TERM "-$pgid" 2>/dev/null',
  '    pgids="$pgids $pgid"',
  "  done",
  "done",
];
// The blocking arm: TERM only asks, so the kill loop returns while the tree is still unwinding, and a caller that
// Removes the dirs that tree has open — `cache clean` — has to see it gone rather than merely signalled. It is
// Deliberately not the default: the startup sweep is fire-and-forget off the critical path and must never make a run
// Wait on a corpse. Past the deadline it gives up rather than hanging, leaving the caller the racy removal it would
// Always have done.
//
// The wait watches the killed process GROUPS, not the markers it was handed: only the run's shell carries the marker
// In its cmdline, and TERM kills that shell first while the `bwrap` beneath it — the process actually holding the
// Store and snapshot dirs — is still unwinding, so a marker that stops matching proves nothing. It polls, because a
// POSIX shell cannot `wait` on a process it did not fork.
const WAIT_SCRIPT_LINES: readonly string[] = [
  `deadline=$(($(date +%s) + ${WSL_REAP_WAIT_TIMEOUT_SECONDS}))`,
  'while [ "$(date +%s)" -lt "$deadline" ]; do',
  "  alive=",
  "  for pgid in $pgids; do",
  '    pgrep -g "$pgid" >/dev/null 2>&1 && alive=1',
  "  done",
  '  [ -n "$alive" ] || break',
  `  sleep ${WSL_REAP_WAIT_INTERVAL_SECONDS}`,
  "done",
];
// Build the argv for a reaper: a fresh `wsl.exe --exec` running the script above over every marker it is handed.
// Three callers hand it different sets: the interrupted run itself passes its own marker (createWslOsBackend's
// OnTerminate), the startup sweep passes every marker whose owning host process is dead (reapOrphanedWslRuns), and a
// `cache clean` passes that same set with `isBlocking` — one `wsl.exe` launch for the whole set either way, since a
// Launch is a service RPC plus a relay process.
//
// The markers ride the argv rather than the script text so a set of any size needs no quoting rules. That does put
// Every marker in this reaper's own cmdline, which its `pgrep` then matches: `self=$$` excludes this shell, and two
// Reapers that were handed the same marker can match each other — harmless, since they are doing the same work and
// Whichever survives finishes it.
export const buildWslReapCommand = (markers: readonly string[], isBlocking = false): [string, ...string[]] => {
  const script = [...KILL_SCRIPT_LINES, ...(isBlocking ? WAIT_SCRIPT_LINES : [])].join("\n");
  return [WSL_EXECUTABLE, "--exec", "sh", "-c", script, WSL_REAPER_SHELL_NAME, ...markers];
};
