import type { RectangleSide } from "#src/models/genshinParity/probe/RectangleSide";
import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

// A rectangle of a reference, read on each side asked for: the reference's own pixels, and our last shot of its screen
export interface RectangleProbe {
  ours?: RectangleSide;
  rect: ImageRegion;
  reference?: RectangleSide;
}
