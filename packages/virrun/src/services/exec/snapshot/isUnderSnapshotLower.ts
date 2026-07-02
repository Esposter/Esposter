import { NODE_MODULES_DIRECTORY } from "@/services/exec/util/constants";
// Whether an overlay-upper path is cache-owned (drop) vs real source the persist flush must reconcile
// (specs/write-back.md). Three cache-owned classes: (1) the snapshot lower materialises node_modules AND the shared
// Parents housing the per-package ones (`packages/<pkg>`), so an ancestor-walk over lower paths wrongly masks a
// Source file living under such a parent (`packages/<pkg>/src/foo.ts`) — the bug that stranded `lint:fix` edits — so
// Mask only the snapshot-lower entry itself and anything inside a `node_modules` tree; (2) an environment's prepare
// `outputDirs` (e.g. `packages/app/.nuxt`) are owned by the source-keyed prepare layer, never the host, so mask the
// Output dir and its whole subtree — a non-output sibling still flushes.
export const isUnderSnapshotLower = (
  relativePath: string,
  snapshotLowerPaths: ReadonlySet<string>,
  outputDirs: readonly string[],
): boolean =>
  snapshotLowerPaths.has(relativePath) ||
  relativePath.split("/").includes(NODE_MODULES_DIRECTORY) ||
  outputDirs.some((outputDir) => relativePath === outputDir || relativePath.startsWith(`${outputDir}/`));
