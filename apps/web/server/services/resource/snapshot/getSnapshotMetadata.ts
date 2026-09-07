import type { SnapshotReason } from "#shared/models/resource/SnapshotReason";

interface SnapshotMetadataInput {
  label?: string;
  reason?: SnapshotReason;
  summary?: string;
}

// The blob metadata a snapshot carries, and the one place its encoding is decided. Metadata travels as http
// Headers, so a value is ASCII or it is rejected outright — and a label is whatever the owner typed. The reason
// Is an enum member and needs no encoding, but goes through the same pair so a reader never has to know which
// Fields were encoded. Absent on a published snapshot, whose channel already says why it was taken
export const getSnapshotMetadata = ({ label = "", reason, summary = "" }: SnapshotMetadataInput): Record<string, string> => ({
  label: encodeURIComponent(label),
  ...(reason ? { reason } : {}),
  summary: encodeURIComponent(summary),
});
