import type { ParityRegion } from "#src/models/genshinParity/shared/ParityRegion";

// A reference is a wiki file, or one frame of a recording kept in the captures folder: a still the wiki lacks is taken
// From the game itself, at the second it shows, cropped to the game's own screen when the recording letterboxes it
// (a public video of a phone or a window)
export type ParityReference = ParityReferenceBase &
  (
    | { capture: string; crop?: ParityRegion; seconds: number; wikiTitle?: never }
    | { capture?: never; crop?: never; seconds?: never; wikiTitle: string }
  );
interface ParityReferenceBase {
  // The reference is drawn behind the screen, for an overlay (an interface over a scene) judged over the very frame
  // It was taken from, so only the overlay can differ
  isBackdrop?: true;
  // The pixels, in the reference's own, its component's landmarks are seen at, read by eye and snapped to the nearest
  // Corner, which `pose` solves the camera from
  landmarks?: Record<string, [number, number]>;
  // The props the screen is shot with in place of its fixture's, where one screen is judged against several references
  // (a scene at each time of day)
  props?: Record<string, unknown>;
  // The part a comparison scores, in the reference's own pixels, so the world behind a menu never counts against it;
  // The whole frame when absent
  region?: ParityRegion;
  // The parity page's screen that recreates it, by its component's name
  screen: string;
}
