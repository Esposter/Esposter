import { NODE_MODULES_DIRECTORY } from "@/services/exec/util/constants";
// Decide whether an overlay-upper path belongs to the dependency closure and must be dropped, vs a real source
// File the persist flush has to reconcile onto the host (specs/write-back.md). Pure — flushUpperToHost owns the
// Probe and the fs ops. The snapshot lower materialises node_modules trees AND the shared parent dirs that house
// The per-package ones (`packages`, `packages/<pkg>`), so an ancestor-walk over snapshot-lower paths wrongly masks
// A source file that merely lives under such a shared parent (`packages/<pkg>/src/foo.ts`) — the bug that left
// `lint:fix` edits stranded in the sandbox. Mask only two things: the snapshot-lower entry itself (the install's
// Own dirs — harmless to skip, the host already has them), and anything inside a `node_modules` tree (the closure,
// Including new cache writes with no snapshot entry of their own). A non-node_modules sibling of a shared parent is
// Source, and flushes.
export const isUnderSnapshotLower = (relativePath: string, snapshotLowerPaths: ReadonlySet<string>): boolean =>
  snapshotLowerPaths.has(relativePath) || relativePath.split("/").includes(NODE_MODULES_DIRECTORY);
