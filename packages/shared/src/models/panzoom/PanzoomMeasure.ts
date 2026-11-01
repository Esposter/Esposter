import type { PanzoomBox } from "#src/models/panzoom/PanzoomBox";
import type { PanzoomPoint } from "#src/models/panzoom/PanzoomPoint";
import type { PanzoomSize } from "#src/models/panzoom/PanzoomSize";

// One read of the element and its parent, in viewport coordinates: the layout centre, the unscaled size and the parent's content box
export interface PanzoomMeasure {
  center: PanzoomPoint;
  parent: PanzoomBox;
  size: PanzoomSize;
}
