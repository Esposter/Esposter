import type { SnapshotReason } from "#shared/models/resource/SnapshotReason";

interface SnapshotMetadataInput {
  label?: string;
  reason?: SnapshotReason;
  summary?: string;
}

// The blob metadata a snapshot carries, and the one place its encoding is decided. Metadata travels as http
// Headers, so a value is ASCII or it is rejected outright — a label is whatever the owner typed and a summary
// Is built from a type's own content, so both are percent-encoded on the way in and decoded on the way out
// Rather than trusted to be spellable in ASCII. The reason is an enum member and needs none, but goes through
// The same pair so a reader never has to know which fields were encoded.
// Absent on a published snapshot, whose reason is that it was published — the row says so from its channel
export const getSnapshotMetadata = ({ label = "", reason, summary = "" }: SnapshotMetadataInput): Record<string, string> => ({
  label: encodeURIComponent(label),
  ...(reason ? { reason } : {}),
  summary: encodeURIComponent(summary),
});
