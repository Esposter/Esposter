// One block's line in the UI index's manifest: the SHA-256 of the block's bytes its index was built from, and how many
// RectTransforms the index holds, so an unchanged block is not read again
export interface UiIndexManifestEntry {
  contentHash: string;
  entryCount: number;
}
