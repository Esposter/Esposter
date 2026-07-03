import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { readdirSync } from "node:fs";
import { join } from "node:path";
// The inverse of pruneSnapshotUpper: a prepare capture's upper holds the framework's generated `outputs` (e.g.
// Packages/app/.nuxt) plus incidental churn the prepare command made against the dep tree and lockfile. This layer
// Owns only the declared `outputs` — everything else is already supplied by the deps snapshot below — so keep every
// Output subtree (and the directories on the path to one) and drop the rest in a single rm per discarded subtree.
// `outputs` are workspace-root-relative POSIX paths matched against the upper's own layout; filesystem ops use the
// Host-native join so it runs from the win32 host over a `\\wsl.localhost` UNC.
export const pruneToOutputs = (upperDir: string, outputs: readonly string[]): void => {
  const outputSet = new Set(outputs);
  const prefixSet = new Set<string>();
  for (const output of outputs) {
    const segments = output.split("/");
    for (let index = 1; index < segments.length; index++) prefixSet.add(segments.slice(0, index).join("/"));
  }
  const walk = (absoluteDir: string, relative: string): void => {
    for (const entry of readdirSync(absoluteDir, { withFileTypes: true })) {
      const childRelative = relative === "" ? entry.name : `${relative}/${entry.name}`;
      const childAbsolute = join(absoluteDir, entry.name);
      // An output root — keep the whole subtree, never descend.
      if (outputSet.has(childRelative)) continue;
      // On the path to a deeper output — descend to keep the output while pruning its siblings.
      else if (entry.isDirectory() && prefixSet.has(childRelative)) walk(childAbsolute, childRelative);
      // Anything else the prepare command wrote (dep-tree churn, caches, a regenerated lockfile) — drop it whole.
      else removeSnapshotDirectory(childAbsolute);
    }
  };
  walk(upperDir, "");
};
