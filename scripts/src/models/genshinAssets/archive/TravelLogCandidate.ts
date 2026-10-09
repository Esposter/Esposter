import type { ArchiveCandidate } from "#src/models/genshinAssets/archive/ArchiveCandidate";

// A Travel Log candidate: an entry before its name is checked, and the main quest it is filed under, whose finish opens it
export interface TravelLogCandidate extends ArchiveCandidate {
  questId: number;
}
