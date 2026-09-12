import type { SnapshotReason } from "#shared/models/resource/SnapshotReason";

export interface SnapshotMetadataInput {
  reason?: SnapshotReason;
  summary?: string;
}
