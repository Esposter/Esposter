import type { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";
import type { SnapshotReason } from "#shared/models/resource/SnapshotReason";

// One row of a resource's version history, whichever channel it came from. The two channels are separate
// Address spaces in storage and one list on screen, so the row says which channel it belongs to rather than
// Leaving the reader to infer it from a number that collides across them
export interface SnapshotVersion {
  channel: SnapshotChannel;
  // Whether this is the version the public is being served. Only ever true on the published channel — a
  // Revision is a point to return to, never a live one
  isCurrent: boolean;
  // What the owner named this version, empty unless they took it by hand. A row is chosen by what it says it
  // Is, never by its ordinal, which is why both this and the reason ride the listing
  label: string;
  // Absent on a published row, whose reason is that it was published
  reason?: SnapshotReason;
  takenAt: Date;
  version: number;
}
