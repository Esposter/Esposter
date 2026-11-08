import type { Provenance } from "#src/models/provenance/Provenance";

// An output read from its stamp: the command the stamp names, or the path of a stamp no reader could parse, and the
// Stamp itself when one could be read
export interface StampedOutput {
  command: string;
  provenance?: Provenance;
}
