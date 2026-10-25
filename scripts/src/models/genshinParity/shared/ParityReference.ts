import type { ParityPlacement } from "#src/models/genshinParity/shared/ParityPlacement";
import type { ParityReferenceBase } from "#src/models/genshinParity/shared/ParityReferenceBase";
import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

// A reference is a wiki file, or one frame of a recording kept in the captures folder: a still the wiki lacks is taken
// From the game itself, at the second it shows, cropped to the game's own screen when the recording letterboxes it
// (a public video of a phone or a window). A wiki crop with no whole frame behind it is placed in the frame it was cut
// From, so it is shot and scored at that frame's scale. A screen no reference records yet is pending, with the reason it
// Has none: it names no frame or wiki file, so no run scores it and the committed report lists it as pending
export type ParityReference = ParityReferenceBase &
  (
    | { capture: string; crop?: ImageRegion; pending?: never; placement?: never; seconds: number; wikiTitle?: never }
    | { capture?: never; crop?: never; pending: string; placement?: never; seconds?: never; wikiTitle?: never }
    | {
        capture?: never;
        crop?: never;
        pending?: never;
        placement?: ParityPlacement;
        seconds?: never;
        wikiTitle: string;
      }
  );
