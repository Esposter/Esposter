import { checkIsExcludedPath } from "#src/services/exec/util/checkIsExcludedPath";
import { NODE_MODULES_DIRECTORY } from "#src/services/exec/util/constants";
// Whether an overlay-upper path is cache-owned (drop) vs real source the persist flush must reconcile
// (specs/write-back.md). Two masked classes: (1) the snapshot lower materialises node_modules AND the shared
// Parents housing the per-package ones (`packages/<pkg>`), so an ancestor-walk over lower paths wrongly masks a
// Source file living under such a parent (`packages/<pkg>/src/foo.ts`) — the bug that stranded `lint:fix` edits — so
// Mask only the snapshot-lower entry itself and anything inside a `node_modules` tree; (2) `maskedPaths`, matched by
// The shared checkIsExcludedPath so the mask and the source-side exclude can never drift. That covers an environment's
// Prepare outputs (e.g. `packages/app/.nuxt`, owned by the source-keyed prepare layer, never the host) and, on win32,
// The whole mirror exclude set: a path kept out of the source mirror has no upper entry that could legitimately have
// Come from the host, so anything the sandbox wrote there is a ghost of a stale mirror — flushing it materialises a
// Tree the user already deleted. A sibling that merely shares a masked path's prefix still flushes.
export const isUnderSnapshotLower = (
  relativePath: string,
  snapshotLowerPaths: ReadonlySet<string>,
  maskedPaths: readonly string[],
): boolean =>
  snapshotLowerPaths.has(relativePath) ||
  relativePath.split("/").includes(NODE_MODULES_DIRECTORY) ||
  checkIsExcludedPath(relativePath, maskedPaths);
