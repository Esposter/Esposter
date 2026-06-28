import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { OverlayLayers } from "@/models/exec/OverlayLayers";

import { InvalidOperationError, Operation } from "@esposter/shared";
// Builds the bubblewrap argv (excluding the `bwrap` binary itself — the factory spawns bwrap with
// These args) that wraps a command in a RAM-overlay sandbox. `--ro-bind / /` gives the read-only
// System view; `--overlay-src <dir>` sets the read-only lower (the real source) and the top mount over
// The working dir is one of two shapes (see `overlayLayers`): by default `--tmp-overlay <dir>` makes the
// Upper an invisible tmpfs (RAM) — so reads fall through to the source and every write stays in RAM,
// Never touching the host disk. `--unshare-all` drops into fresh namespaces (no root, no net) and
// `--die-with-parent` ties the sandbox lifetime to ours. `isNetworkEnabled` re-adds just the network
// Namespace (`--share-net`, only valid alongside `--unshare-all`) for workloads that must fetch, e.g. a
// Real install. `bindDirs` are bind-mounted writable at their own path after the RAM overlay (so they
// Overmount it) — for intentional host caches like the shared package store, whose writes must persist on
// Disk instead of vanishing in RAM.
//
// `overlayLayers` parametrizes the working-dir overlay for the snapshot layer (specs/snapshot-fork.md):
//   - `lowerDirs` adds extra read-only `--overlay-src` lowers above the source, lowest-priority first — a
//     Fork run stacks the frozen snapshot upper here so its files shadow the source.
//   - `upperDir` + `workDir` switch the top mount to a persistent `--overlay <upperDir> <workDir> <dir>`, so
//     A capture run's post-install writes land as real files on disk instead of vanishing in tmpfs. Both
//     Must be supplied together; one without the other is a misuse and throws.
//
// A string command runs through `/bin/sh -c` (operator passthrough); an argv array runs as-is. Pure
// Function so the argv shape is unit-testable on any platform (incl. win32).
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
