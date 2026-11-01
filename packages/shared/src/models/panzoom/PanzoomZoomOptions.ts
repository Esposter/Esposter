import type { PanzoomPanOptions } from "#src/models/panzoom/PanzoomPanOptions";
import type { PanzoomPoint } from "#src/models/panzoom/PanzoomPoint";

// The options one zoom call takes, where focal is the viewport point the zoom keeps still
export interface PanzoomZoomOptions extends PanzoomPanOptions {
  focal?: PanzoomPoint;
}
