import type { VersionAnchor } from "#src/models/VersionAnchor";
import type { WrittenVersion } from "#src/models/WrittenVersion";
import type { ResultAsync } from "neverthrow";

export interface KeyframeStore {
  // Takes the hashes an eviction released and the hashes surviving records still name — as their own or as a
  // Base — and returns the objects it deleted, so the caller can credit their bytes back
  collect: (releasedHashes: string[], retainedHashes: string[]) => ResultAsync<string[], Error>;
  read: (hash: string) => ResultAsync<Uint8Array, Error>;
  // The anchor is the caller's state, so the store never has to know what a lineage is
  write: (plaintext: Uint8Array, anchor: VersionAnchor) => ResultAsync<WrittenVersion, Error>;
}
