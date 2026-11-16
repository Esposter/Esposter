import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityMotion } from "#src/models/genshinParity/shared/ParityMotion";

// How the parity page is opened on a screen: its size, the props and backdrop a reference hands it, the motion it holds
// When shot at times, and the component whose exports it draws in place of the scene's own parts
export interface ParityPageOptions {
  // An image drawn behind the screen, for an overlay shot over the very frame it is judged against
  backdropPath?: string | undefined;
  height: number;
  // Whether the backdrop is the reference's own frame, which holds the game's blur and wash of the world already, so the
  // Screen's own world blur and wash are not drawn over it a second time
  isBackdropBlurred?: boolean | undefined;
  // Whether the page's clock is faked, moved on only by the caller, and its timers and frames with it
  isClockFaked?: boolean | undefined;
  // Whether frames are drawn as fast as they can be rather than at the display's refresh, for a frame's time to be read
  isFrameRateUnlimited?: boolean | undefined;
  // The motion the page holds at its start, for a shot at times
  motion?: ParityMotion | undefined;
  // The page's address up to its query: the dev server's by default, a preview server's when a load run measures a build
  pageRoot?: string | undefined;
  // Props over the fixture's, as JSON the page reads
  props?: Record<string, unknown> | undefined;
  screen: string;
  // The fixture's variant the page renders over its props, by its name in the fixture's `variants`
  variant?: string | undefined;
  width: number;
  // The left edge, in the reference's pixels, of the game window the screen is placed at, for a frame that pillarboxes it
  windowLeft?: number | undefined;
  // A component whose exports the page draws in place of the scene's own parts, served to it from the exports
  witness?: DerivedAssetComponent | undefined;
  // The only meshes the witness's placements keep, for a page that draws a few of a component's parts and no more
  witnessMeshes?: readonly string[] | undefined;
}
