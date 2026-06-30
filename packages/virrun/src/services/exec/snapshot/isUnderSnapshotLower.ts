import { NODE_MODULES_DIRECTORY } from "@/services/exec/util/constants";
// Whether an overlay-upper path is dependency-closure (drop) vs real source the persist flush must reconcile
// (specs/write-back.md). The snapshot lower materialises node_modules AND the shared parents housing the
// Per-package ones (`packages/<pkg>`), so an ancestor-walk over lower paths wrongly masks a source file living
// Under such a parent (`packages/<pkg>/src/foo.ts`) — the bug that stranded `lint:fix` edits. So mask only the
// Snapshot-lower entry itself and anything inside a `node_modules` tree; a non-node_modules sibling flushes.
export const isUnderSnapshotLower = (relativePath: string, snapshotLowerPaths: ReadonlySet<string>): boolean =>
  snapshotLowerPaths.has(relativePath) || relativePath.split("/").includes(NODE_MODULES_DIRECTORY);
