// The `$0` we give the WSL-side `sh -c` that hosts a run's bwrap, plus a per-run suffix (createWslProcessMarker).
// It makes the run's process tree findable Linux-side by cmdline (pgrep -f) so a Ctrl+C reaper can kill its whole
// Process group without a Windows→WSL PID handoff. Kept generic ("virrun-bwrap") so it reads clearly in `ps`.
export const VIRRUN_WSL_PROCESS_MARKER = "virrun-bwrap";
