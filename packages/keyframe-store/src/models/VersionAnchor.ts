// What a lineage knows about its current keyframe, handed to every write. The store holds no notion of a
// Lineage at all — the caller derives one anchor per history from its own records, and both fields reset
// Whenever a write comes back with an empty base
export interface VersionAnchor {
  // The bytes already anchored to this keyframe, which the segment budget is measured against
  anchoredBytes: number;
  // Empty for a lineage that has no keyframe yet
  hash: string;
}
