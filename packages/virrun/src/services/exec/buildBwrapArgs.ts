import type { ExecOptions } from "@/models/exec/ExecOptions";
// Builds the bubblewrap argv (excluding the `bwrap` binary itself — the factory spawns bwrap with
// These args) that wraps a command in a RAM-overlay sandbox. `--ro-bind / /` gives the read-only
// System view; `--overlay-src <dir> --tmp-overlay <dir>` overmounts only the working dir as an
// Overlay whose lower is the real source and whose upper is an invisible tmpfs (RAM) — so reads fall
// Through to the source and every write stays in RAM, never touching the host disk. `--unshare-all`
// Drops into fresh namespaces (no root, no net) and `--die-with-parent` ties the sandbox lifetime to
// Ours. `isNetworkEnabled` re-adds just the network namespace (`--share-net`, only valid alongside
// `--unshare-all`) for workloads that must fetch, e.g. a real install. `overlayDirs` each get their
// Own RAM overlay so a process can write into them (e.g. a package store's index) without the write
// Reaching the host disk. A string command runs through `/bin/sh -c` (operator passthrough); an argv
// Array runs as-is. Pure function so the argv shape is unit-testable on any platform (incl. win32).
export const buildBwrapArgs = (
  command: readonly string[] | string,
  cwd: string,
  { isNetworkEnabled = false, overlayDirs = [] }: Pick<ExecOptions, "isNetworkEnabled" | "overlayDirs"> = {},
): string[] => {
  const dir = cwd === "" ? process.cwd() : cwd;
  const commandArgs = Array.isArray(command) ? [...command] : ["/bin/sh", "-c", command];
  const overlays = [dir, ...overlayDirs].flatMap((overlayDir) => [
    "--overlay-src",
    overlayDir,
    "--tmp-overlay",
    overlayDir,
  ]);
  return [
    "--unshare-all",
    ...(isNetworkEnabled ? ["--share-net"] : []),
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
    ...overlays,
    "--chdir",
    dir,
    "--",
    ...commandArgs,
  ];
};
