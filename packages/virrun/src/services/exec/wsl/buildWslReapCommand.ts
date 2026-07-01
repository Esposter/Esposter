// Build the argv for the Ctrl+C reaper: a fresh `wsl.exe --exec` that finds the interrupted run's shell by its
// Unique `$0` marker (createWslProcessMarker) and kills that shell's entire process group. Group kill is what a
// Terminal does for Ctrl+C — it reaches the host-side `bwrap` (collapsing its PID namespace, so the sandboxed
// Command dies mid-run) as well as the shell, leaving nothing orphaned to wedge the next run. `self=$$` excludes
// This reaper's own shell (its `-c` text also contains the marker); the `-p`/`2>/dev/null` guards keep a race
// Where a matched process already exited from turning into noise. TERM (not KILL) so bwrap can unwind cleanly.
export const buildWslReapCommand = (marker: string): [string, ...string[]] => {
  const script = [
    "self=$$",
    `for pid in $(pgrep -f "${marker}" 2>/dev/null); do`,
    '  [ "$pid" = "$self" ] && continue',
    '  pgid=$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d " ")',
    '  [ -n "$pgid" ] && kill -TERM "-$pgid" 2>/dev/null',
    "done",
  ].join("\n");
  return ["wsl.exe", "--exec", "sh", "-c", script];
};
