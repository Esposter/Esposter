import type { ParityRecordingManifestRow } from "#src/models/genshinParity/reference/ParityRecordingManifestRow";

// What a backfill of the public recordings found: the rows it adds, and how many files already had one.
// The names whose hash differs from their row's are informational.
// The file names no public video names are skipped
export interface PublicRecordingBackfill {
  added: ParityRecordingManifestRow[];
  alreadyHeld: number;
  differing: string[];
  skipped: string[];
}
