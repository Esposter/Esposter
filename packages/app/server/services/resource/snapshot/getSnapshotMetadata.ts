import type { SnapshotReason } from "#shared/models/resource/SnapshotReason";

// The blob metadata a revision carries, and the one place its encoding is decided. Metadata travels as http
// Headers, so a value is ASCII or it is rejected outright — a label is whatever the owner typed, so it is
// Percent-encoded on the way in and decoded on the way out rather than trusted to be spellable in ASCII.
// The reason is an enum member and needs none, but goes through the same pair so a reader never has to know
// Which of the two fields was encoded
export const getSnapshotMetadata = (reason: SnapshotReason, label: string): Record<string, string> => ({
  label: encodeURIComponent(label),
  reason,
});
