import type { ParityRegion } from "#src/models/genshinParity/ParityRegion";

interface ParityReferenceBase {
  // The part a comparison scores, in the reference's own pixels, so the world behind a menu never counts against it;
  // The whole frame when absent
  region?: ParityRegion;
  // The parity page's screen that recreates it, by its component's name
  screen: string;
}
// A reference is a wiki file, or one frame of a recording kept in the captures folder: a still the wiki lacks is taken
// From the game itself, at the second it shows
export type ParityReference = ParityReferenceBase &
  ({ capture: string; seconds: number; wikiTitle?: never } | { capture?: never; seconds?: never; wikiTitle: string });
