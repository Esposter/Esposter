import type { ArchiveCandidate } from "#src/models/genshinAssets/archive/ArchiveCandidate";

// A book before its name is checked against the game's text: the candidate's own fields, the id of its material, which is
// The item a book is picked up as, and the id of the localization text its body is read from
export interface BookCandidate extends ArchiveCandidate {
  bodyId: number;
  materialId: number;
}
