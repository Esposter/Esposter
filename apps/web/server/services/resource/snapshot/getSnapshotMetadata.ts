import type { SnapshotReason } from "#shared/models/resource/SnapshotReason";

interface SnapshotMetadataInput {
  reason?: SnapshotReason;
  summary?: string;
}

// The blob metadata a snapshot carries, and the one place its encoding is decided. Metadata travels as http
// Headers, so a value is ASCII or it is rejected outright — and a summary is built from content the owner
// Typed. The reason is an enum member and needs no encoding, but goes through the same pair so a reader never
// Has to know which fields were encoded. Absent on a published snapshot, whose channel already says why it was
// Taken
export const getSnapshotMetadata = ({ reason, summary = "" }: SnapshotMetadataInput): Record<string, string> => ({
  ...(reason ? { reason } : {}),
  summary: encodeURIComponent(summary),
});
