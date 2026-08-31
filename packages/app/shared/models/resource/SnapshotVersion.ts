import type { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";

// One row of a resource's version history, whichever channel it came from. The two channels are separate
// Address spaces in storage and one list on screen, so the row says which channel it belongs to rather than
// Leaving the reader to infer it from a number that collides across them
export interface SnapshotVersion {
  channel: SnapshotChannel;
  // Whether this is the version the public is being served. Only ever true on the published channel — a
  // Checkpoint is a point to return to, never a live one
  isCurrent: boolean;
  takenAt: Date;
  version: number;
}
