import { removeSnapshotDirectory } from "#src/services/exec/snapshot/removeSnapshotDirectory";
import { readdirSync } from "node:fs";
import { join } from "node:path";
// The inverse of pruneSnapshotUpper: a prepare capture's upper holds the framework's generated `outputs` (e.g.
// Packages/app/.nuxt) plus incidental churn the prepare command made against the dep tree and lockfile. This layer
// Owns only the declared `outputs` — everything else is already supplied by the deps snapshot below — so keep every
// Output subtree (and the directories on the path to one) and drop the rest in a single rm per discarded subtree.
// `outputs` are workspace-root-relative POSIX paths matched against the upper's own layout; filesystem ops use the
// Host-native join so it runs from the win32 host over a `\\wsl.localhost` UNC.
export const pruneToOutputs = (upperDirectory: string, outputs: readonly string[]): void => {
  const outputSet = new Set(outputs);
  // Every proper ancestor of an output, grown one segment at a time so a depth-d output costs d appends rather than
  // D joins of up to d segments
  const prefixSet = new Set<string>();
  for (const output of outputs) {
    let prefix = "";
    for (const segment of output.split("/").slice(0, -1)) {
      prefix = prefix ? `${prefix}/${segment}` : segment;
      prefixSet.add(prefix);
    }
  }
  const walk = (absoluteDirectory: string, relativePath: string): void => {
    for (const entry of readdirSync(absoluteDirectory, { withFileTypes: true })) {
      const childRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      const childAbsolutePath = join(absoluteDirectory, entry.name);
      // An output root — keep the whole subtree, never descend.
      if (outputSet.has(childRelativePath)) continue;
      // On the path to a deeper output — descend to keep the output while pruning its siblings.
      else if (entry.isDirectory() && prefixSet.has(childRelativePath)) walk(childAbsolutePath, childRelativePath);
      // Anything else the prepare command wrote (dep-tree churn, caches, a regenerated lockfile) — drop it whole.
      else removeSnapshotDirectory(childAbsolutePath);
    }
  };
  walk(upperDirectory, "");
};
