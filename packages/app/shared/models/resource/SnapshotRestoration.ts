import type { Resource } from "@esposter/db-schema";

// What a restore hands back. A restore is the one operation that destroys draft work on purpose, so it takes a
// Revision of the draft it is about to replace before it replaces it — and that revision is the undo, which is
// Why the version it wrote rides back with the resource rather than being looked up afterwards from a listing
// That cannot say which of its rows this restore had just taken
export interface SnapshotRestoration {
  resource: Resource;
  // Absent when the working copy had no content blob to take a revision of, which is the one state a restore
  // Leaves nothing to undo to
  undoRevisionVersion?: number;
}
