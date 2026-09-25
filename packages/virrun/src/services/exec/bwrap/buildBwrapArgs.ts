import type { ExecOptions } from "#src/models/exec/ExecOptions";
import type { OverlayLayers } from "#src/models/exec/OverlayLayers";

import { resolveCwd } from "#src/services/exec/util/resolveCwd";
// Builds the bubblewrap argv (without the `bwrap` binary) wrapping a command in a RAM-overlay sandbox. Flag intent:
//   - `--ro-bind / /` read-only system view; `--overlay-src <sourceDirectory>` read-only lower (the real source
//     Content).
//   - default `--tmp-overlay <cwd>` makes the upper an invisible tmpfs, so writes stay in RAM, never the host disk.
//   - `--unshare-all` fresh namespaces (no root, no net); `--die-with-parent` ties sandbox lifetime to ours.
//   - `isNetworkEnabled` re-adds only the network namespace (`--share-net`, valid only with `--unshare-all`).
//   - `bindDirectories` bind-mounted writable AFTER the overlay (overmounting it) for host caches whose writes must
//     Persist.
//
// `overlayLayers` parametrizes the working-directory overlay (apps/web/content/docs/virrun/snapshot-and-fork.md):
// `lowerDirectories` adds extra read-only lowers (a fork stacks the frozen snapshot upper here to shadow the source);
// `persistentOverlay` switches to a persistent `--overlay` so a capture's writes land on disk.
//
// `sourceDirectory` is the read-only source lower's real location, decoupled from `cwd` (the overlay *mountpoint* +
// Chdir). They coincide natively, so it defaults to `cwd`. Under the win32 os backend they diverge: the source content
// Lives on the ext4 mirror (fast v9fs-free reads) but the sandbox must present it at — and chdir into — the repo's
// Logical path, so `pwd` and every absolute path a tool prints match the native baseline instead of leaking the
// Mirror path.
// A string command runs through `/bin/sh -c`; an argv array runs as-is.
export const buildBwrapArgs = (
  command: readonly string[] | string,
  cwd: string,
  { bindDirectories = [], isNetworkEnabled = false }: Pick<ExecOptions, "bindDirectories" | "isNetworkEnabled"> = {},
  { lowerDirectories = [], persistentOverlay }: OverlayLayers = {},
  sourceDirectory = "",
): string[] => {
  const directory = resolveCwd(cwd);
  const source = sourceDirectory || directory;
  const commandArgs = Array.isArray(command) ? [...command] : ["/bin/sh", "-c", command];
  const topOverlay =
    persistentOverlay === undefined
      ? ["--tmp-overlay", directory]
      : ["--overlay", persistentOverlay.upperDirectory, persistentOverlay.workDirectory, directory];
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
    source,
    ...lowerDirectories.flatMap((lowerDirectory) => ["--overlay-src", lowerDirectory]),
    ...topOverlay,
    ...bindDirectories.flatMap((bindDirectory) => ["--bind", bindDirectory, bindDirectory]),
    "--chdir",
    directory,
    "--",
    ...commandArgs,
  ];
};
