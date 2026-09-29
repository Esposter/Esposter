import type { ParityRegion } from "#src/models/genshinParity/ParityRegion";

// A reference is a wiki file, or one frame of a recording kept in the captures folder: a still the wiki lacks is taken
// From the game itself, at the second it shows, cropped to the game's own screen when the recording letterboxes it
// (a public video of a phone or a window)
export type ParityReference = ParityReferenceBase &
  (
    | { capture: string; crop?: ParityRegion; seconds: number; wikiTitle?: never }
    | { capture?: never; crop?: never; seconds?: never; wikiTitle: string }
  );
interface ParityReferenceBase {
  // The part a comparison scores, in the reference's own pixels, so the world behind a menu never counts against it;
  // The whole frame when absent
  region?: ParityRegion;
  // The parity page's screen that recreates it, by its component's name
  screen: string;
}
