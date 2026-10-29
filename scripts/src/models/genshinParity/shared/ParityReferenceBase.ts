import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityApproval } from "#src/models/genshinParity/shared/ParityApproval";
import type { ParitySilhouette } from "#src/models/genshinParity/shared/ParitySilhouette";
import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

export interface ParityReferenceBase {
  // The measure and bar the screen's compare is set against, where the screen records its own; one that records none is
  // Set against the global default bar
  approval?: ParityApproval;
  // The component whose witness the passes judge the reference by: a screen several components share is measured by
  // Each over the references naming it alone, and a reference naming none is read by no component's passes
  component?: DerivedAssetComponent;
  // The reference is drawn behind the screen, for an overlay (an interface over a scene) judged over the very frame
  // It was taken from, so only the overlay can differ
  isBackdrop?: true;
  // Drawn by an older build than the exports, whose camera and arrangement the current one's differ from, so the passes
  // Judging a scene's geometry against the exports pass it by; it judges what that build did not change
  isOtherBuild?: true;
  // The pixels, in the reference's own, its component's landmarks are seen at, read by eye and snapped to the nearest
  // Corner, which `pose` solves the camera from
  landmarks?: Record<string, [number, number]>;
  // The rectangles within the region a comparison scores, in the reference's own pixels: every other pixel is masked
  // Out of the mean difference and FLIP, so a painted terrain the page does not draw never counts. The whole region when
  // Absent
  mask?: ImageRegion[];
  // The interface's own pieces a backdrop's clean plate fills, each from the pixels around it, for a screen scored whole
  // Over a scene: the world between them stays the frame's own, so every piece is scored over what lies behind it. The
  // Scored region alone when absent
  plate?: ImageRegion[];
  // Where the screenshot `<id>.plate.webp` the plate's pixels come from in place of the reference's was sampled from: the
  // World a screen is laid over, which the still shows nothing of, as the game draws it
  plateSource?: string;
  // The pixel, in the reference's own, the recording's pointer rests at, which the shot moves the page's pointer to, so a
  // Piece the game lights under the pointer is lit in both
  pointer?: [number, number];
  // The reprojection, in the reference's pixels, `pose --write` holds its solved camera to in place of the camera pass's
  // Gate, for a reference whose rigid landmarks cannot reach that gate; the reason is written beside the entry
  poseBar?: number;
  // The props the screen is shot with in place of its fixture's, where one screen is judged against several references
  // (a scene at each time of day)
  props?: Record<string, unknown>;
  // The part a comparison scores, in the reference's own pixels, so the world behind a menu never counts against it;
  // The whole frame when absent
  region?: ImageRegion;
  // The left edge, in the reference's own pixels, of the game window a pillarboxed frame draws the screen in. The page
  // Places the screen's 1920 by 1080 canvas there at a unit of one, as the game draws its interface at the window's height,
  // Overflowing to the right and clipped by the frame, so the screen carries no offset of its own
  windowLeft?: number;
  // The parity page's screen that recreates it, by its component's name
  screen: string;
  // The glyphs within the region whose strokes alone a comparison scores, beside the mask's rectangles: each split from
  // The ground behind it in the reference's own pixels, so a name's strokes count and the painted terrain between them,
  // Which the page does not draw, never does
  silhouettes?: ParitySilhouette[];
  // The fixture's variant the screen is shot in, by its name in the fixture's `variants`, for a state its props alone do
  // Not draw, such as the logo a language's client shows
  variant?: string;
}
