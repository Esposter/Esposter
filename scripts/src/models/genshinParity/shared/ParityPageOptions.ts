import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityMotion } from "#src/models/genshinParity/shared/ParityMotion";

// How the parity page is opened on a screen: its size, the props and backdrop a reference hands it, the motion it holds
// When shot at times, and the component whose exports it draws in place of the scene's own parts
export interface ParityPageOptions {
  // An image drawn behind the screen, for an overlay shot over the very frame it is judged against
  backdropPath?: string;
  height: number;
  // Whether the page's clock is faked, moved on only by the caller, and its timers and frames with it
  isClockFaked?: boolean;
  // Whether frames are drawn as fast as they can be rather than at the display's refresh, for a frame's time to be read
  isFrameRateUnlimited?: boolean;
  // The motion the page holds at its start, for a shot at times
  motion?: ParityMotion;
  // Props over the fixture's, as JSON the page reads
  props?: Record<string, unknown>;
  screen: string;
  width: number;
  // A component whose exports the page draws in place of the scene's own parts, served to it from the exports
  witness?: DerivedAssetComponent;
}
