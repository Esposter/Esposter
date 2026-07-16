import { ORPHAN_REAP_MINIMUM_AGE_SECONDS } from "@/services/exec/util/constants";
// Build the argv for the startup orphan reaper: a `wsl.exe --exec` that finds every virrun run's shell by the shared
// Base `$0` marker and group-kills only the *orphaned* ones. A run's onTerminate reaper (buildWslReapCommand) fires
// Only on a handled SIGINT/SIGTERM — a hard kill (SIGKILL, crash, terminal close, `wsl --shutdown`) skips it, so the
// WSL-side `sh`+bwrap tree reparents to init and survives, pinning the store/snapshot open. This sweep, run once at
// Os-backend startup, reaps those corpses. The orphan test is exact, not heuristic, and every guard fails *closed* —
// Skip rather than kill an unconfirmed process — because a false positive TERMs a concurrent live run's whole group
// Mid-flight (its sync's tar/extract dies mid-write and its bwrap surfaces as a sandbox-setup failure), which
// Parallel runs (`pnpm -r --parallel`) expose constantly:
//
// - `self=$$` excludes this reaper's own shell (its `-c` text also carries the marker).
// - Only process-group leaders (`pid == pgid`) are candidates: every fork of a live run's shell — a subshell, a
//   Command substitution, the pre-exec window of any command — inherits the marker-bearing cmdline but is parented
//   By `sh`, not `Relay`, so without this gate a sweep landing in that window group-kills the live run.
// - A live run's shell is parented by the `wsl.exe` `Relay(<pid>)` process; once its client dies the shell is
//   Reparented, so a non-`Relay` parent means orphaned. An *unreadable* parent comm skips — the process exiting
//   Mid-scan must not fall through to the kill.
// - A minimum age (ORPHAN_REAP_MINIMUM_AGE_SECONDS) skips just-spawned shells whose Relay parent may not be
//   Established yet and just-finished shells unwinding after their Relay died; a true corpse is always older.
//
// TERM (not KILL) lets bwrap unwind. Every lookup is `2>/dev/null`-guarded so a process that exits mid-scan is
// Silently skipped.
export const buildWslOrphanReapCommand = (marker: string): [string, ...string[]] => {
  const script = [
    "self=$$",
    `for pid in $(pgrep -f "${marker}" 2>/dev/null); do`,
    '  [ "$pid" = "$self" ] && continue',
    '  pgid=$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d " ")',
    '  [ "$pid" = "$pgid" ] || continue',
    '  ppid=$(cut -d" " -f4 /proc/"$pid"/stat 2>/dev/null)',
    '  [ -z "$ppid" ] && continue',
    '  parentComm=$(cat /proc/"$ppid"/comm 2>/dev/null)',
    '  [ -z "$parentComm" ] && continue',
    '  case "$parentComm" in Relay*) continue;; esac',
    '  etimes=$(ps -o etimes= -p "$pid" 2>/dev/null | tr -d " ")',
    `  { [ -n "$etimes" ] && [ "$etimes" -ge ${ORPHAN_REAP_MINIMUM_AGE_SECONDS} ]; } || continue`,
    '  kill -TERM "-$pgid" 2>/dev/null',
    "done",
  ].join("\n");
  return ["wsl.exe", "--exec", "sh", "-c", script];
};
