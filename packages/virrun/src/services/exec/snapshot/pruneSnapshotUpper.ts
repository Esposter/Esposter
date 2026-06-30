import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { NODE_MODULES_DIRECTORY } from "@/services/exec/util/constants";
import { readdirSync } from "node:fs";
import { join } from "node:path";
// A cheap structural probe: does this subtree hold a node_modules anywhere? Short-circuits on the first match and
// Never descends *into* a node_modules — a symlink-dense forest there is nothing to learn from — so it stays a pure
// Readdir walk with no removal cost, runnable even from the host over a `\\wsl.localhost` UNC by listing alone.
const hasNodeModules = (dir: string): boolean =>
  readdirSync(dir, { withFileTypes: true }).some(
    (entry) => entry.isDirectory() && (entry.name === NODE_MODULES_DIRECTORY || hasNodeModules(join(dir, entry.name))),
  );
// A captured snapshot upper is everything the frozen `pnpm install` wrote: the dependency closure (node_modules)
// Plus any source-tree artifact a postinstall lifecycle script generated (e.g. `nuxt prepare` → packages/app/.nuxt).
// Those artifacts derive from *source*, but the snapshot is keyed only on the lockfile, so freezing them lets a fork
// Serve a stale copy that shadows the host's fresh one the moment source moves on — silently diverging the sandboxed
// Toolchain from native (a type-aware linter reads the stale graph, collapses types to `any`, and misfires). Prune
// The upper down to the closure: keep every node_modules tree (and the directories on the path to one), drop
// Everything else in a single rm per discarded subtree. A `prepare` hook regenerates the dropped artifacts fresh per
// Fork, so the lockfile-keyed snapshot only ever owns what the lockfile actually determines.
export const pruneSnapshotUpper = (dir: string): void => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const entryPath = join(dir, entry.name);
    // The closure itself — keep it whole, never descend.
    if (entry.isDirectory() && entry.name === NODE_MODULES_DIRECTORY) continue;
    // A directory only worth keeping as the path to a deeper closure: keep it, but prune the artifacts beside it.
    else if (entry.isDirectory() && hasNodeModules(entryPath)) pruneSnapshotUpper(entryPath);
    // A pure artifact subtree, or a file/symlink the install wrote outside any closure (a regenerated lockfile,
    // A codegen output) — drop the whole thing in one removal.
    else removeSnapshotDirectory(entryPath);
  }
};
