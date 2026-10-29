import type { ParityReferenceKind } from "#src/models/genshinParity/reference/ParityReferenceKind";

// One screenshot `references pack` packed: its committed file, the entry it serves, what it was drawn from, and its size
// Before and after the pack
export interface ReferencePackFile {
  bytesAfter: number;
  bytesBefore: number;
  file: string;
  id: string;
  kind: ParityReferenceKind;
}
