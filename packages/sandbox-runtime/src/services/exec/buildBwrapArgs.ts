// Builds the bubblewrap argv (excluding the `bwrap` binary itself — the factory spawns bwrap with
// These args) that wraps a command in a RAM-overlay sandbox. `--ro-bind / /` gives the read-only
// System view; `--overlay-src <dir> --tmp-overlay <dir>` overmounts only the working dir as an
// Overlay whose lower is the real source and whose upper is an invisible tmpfs (RAM) — so reads fall
// Through to the source and every write stays in RAM, never touching the host disk. `--unshare-all`
// Drops into fresh namespaces (no root, no net) and `--die-with-parent` ties the sandbox lifetime to
// Ours. A string command runs through `/bin/sh -c` (operator passthrough); an argv array runs as-is.
// Pure function so the argv shape is unit-testable on any platform (incl. win32). De-risked live:
// A lower file is readable inside and an in-sandbox write leaves nothing on the host scratch dir.
export const buildBwrapArgs = (command: readonly string[] | string, cwd: string): string[] => {
  const dir = cwd === "" ? process.cwd() : cwd;
  const commandArgs = Array.isArray(command) ? [...command] : ["/bin/sh", "-c", command];
  return [
    "--unshare-all",
    "--die-with-parent",
    "--ro-bind",
    "/",
    "/",
    "--dev",
    "/dev",
    "--proc",
    "/proc",
    "--tmpfs",
    "/tmp",
    "--overlay-src",
    dir,
    "--tmp-overlay",
    dir,
    "--chdir",
    dir,
    "--",
    ...commandArgs,
  ];
};
