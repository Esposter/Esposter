import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { OverlayLayers } from "@/models/exec/OverlayLayers";

import { InvalidOperationError, Operation } from "@esposter/shared";
// Builds the bubblewrap argv (without the `bwrap` binary) wrapping a command in a RAM-overlay sandbox. Flag intent:
//   - `--ro-bind / /` read-only system view; `--overlay-src <dir>` read-only lower (the real source).
//   - default `--tmp-overlay <dir>` makes the upper an invisible tmpfs, so writes stay in RAM, never the host disk.
//   - `--unshare-all` fresh namespaces (no root, no net); `--die-with-parent` ties sandbox lifetime to ours.
//   - `isNetworkEnabled` re-adds only the network namespace (`--share-net`, valid only with `--unshare-all`).
//   - `bindDirs` bind-mounted writable AFTER the overlay (overmounting it) for host caches whose writes must persist.
//
// `overlayLayers` parametrizes the working-dir overlay (specs/snapshot-fork.md): `lowerDirs` adds extra read-only
// Lowers (a fork stacks the frozen snapshot upper here to shadow the source); `upperDir`+`workDir` switch to a
// Persistent `--overlay` so a capture's writes land on disk — both required together, one without the other throws.
// A string command runs through `/bin/sh -c`; an argv array runs as-is.
export const buildBwrapArgs = (
  command: readonly string[] | string,
  cwd: string,
  { bindDirs = [], isNetworkEnabled = false }: Pick<ExecOptions, "bindDirs" | "isNetworkEnabled"> = {},
  { lowerDirs = [], upperDir, workDir }: OverlayLayers = {},
): string[] => {
  if ((upperDir === undefined) !== (workDir === undefined))
    throw new InvalidOperationError(
      Operation.Create,
      buildBwrapArgs.name,
      "a persistent overlay needs both upperDir and workDir",
    );
  const dir = cwd === "" ? process.cwd() : cwd;
  const commandArgs = Array.isArray(command) ? [...command] : ["/bin/sh", "-c", command];
  const topOverlay =
    upperDir !== undefined && workDir !== undefined ? ["--overlay", upperDir, workDir, dir] : ["--tmp-overlay", dir];
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
    "--overlay-src",
    dir,
    ...lowerDirs.flatMap((lowerDir) => ["--overlay-src", lowerDir]),
    ...topOverlay,
    ...bindDirs.flatMap((bindDir) => ["--bind", bindDir, bindDir]),
    "--chdir",
    dir,
    "--",
    ...commandArgs,
  ];
};
