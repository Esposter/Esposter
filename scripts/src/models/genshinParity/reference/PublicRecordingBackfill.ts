import type { ParityRecordingManifestRow } from "#src/models/genshinParity/reference/ParityRecordingManifestRow";

// What a backfill of the public recordings found: the rows it adds, how many files already had one, the names whose hash
// differs from their row's (informational), and the file names no public video names
export interface PublicRecordingBackfill {
  added: ParityRecordingManifestRow[];
  alreadyHeld: number;
  differing: string[];
  skipped: string[];
}
