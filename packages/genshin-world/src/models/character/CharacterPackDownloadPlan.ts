import type { CharacterPackDownloadFile } from "#src/models/character/CharacterPackDownloadFile";

// The files of the published packs the cache lacks, and the bytes they come to
export interface CharacterPackDownloadPlan {
  files: CharacterPackDownloadFile[];
  pendingBytes: number;
}
