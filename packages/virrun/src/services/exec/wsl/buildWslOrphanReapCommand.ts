// Build the argv for the startup orphan reaper: a `wsl.exe --exec` that finds every virrun run's shell by the shared
// Base `$0` marker and group-kills only the *orphaned* ones. A run's onTerminate reaper (buildWslReapCommand) fires
// Only on a handled SIGINT/SIGTERM — a hard kill (SIGKILL, crash, terminal close, `wsl --shutdown`) skips it, so the
// WSL-side `sh`+bwrap tree reparents to init and survives, pinning the store/snapshot open. This sweep, run once at
// Os-backend startup, reaps those corpses. The orphan test is exact, not heuristic: a *live* run's shell is parented
// By the `wsl.exe` `Relay(<pid>)` process; once its client dies the shell is reparented to init, so a non-`Relay`
// Parent means orphaned. That never matches a concurrent live run, so no TTL and no risk to another dev's build.
// `self=$$` excludes this reaper's own shell (its `-c` text also carries the marker); TERM (not KILL) lets bwrap
// Unwind. Every lookup is `2>/dev/null`-guarded so a process that exits mid-scan is silently skipped.
export const buildWslOrphanReapCommand = (marker: string): [string, ...string[]] => {
  const script = [
    "self=$$",
    `for pid in $(pgrep -f "${marker}" 2>/dev/null); do`,
    '  [ "$pid" = "$self" ] && continue',
    '  ppid=$(cut -d" " -f4 /proc/"$pid"/stat 2>/dev/null)',
    '  case "$(cat /proc/"$ppid"/comm 2>/dev/null)" in Relay*) continue;; esac',
    '  pgid=$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d " ")',
    '  [ -n "$pgid" ] && kill -TERM "-$pgid" 2>/dev/null',
    "done",
  ].join("\n");
  return ["wsl.exe", "--exec", "sh", "-c", script];
};
