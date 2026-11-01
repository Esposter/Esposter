import type { PanzoomEventDetail } from "#src/models/panzoom/PanzoomEventDetail";
import type { PanzoomOptions } from "#src/models/panzoom/PanzoomOptions";
import type { PanzoomPanOptions } from "#src/models/panzoom/PanzoomPanOptions";
import type { PanzoomPoint } from "#src/models/panzoom/PanzoomPoint";
import type { PanzoomZoomOptions } from "#src/models/panzoom/PanzoomZoomOptions";

// The object createPanzoom returns: the methods that move one element, read its state and change its options
export interface Panzoom {
  bind: () => void;
  destroy: () => void;
  getOptions: () => PanzoomOptions;
  getPan: () => PanzoomPoint;
  getScale: () => number;
  pan: (x: number, y: number, panOptions?: PanzoomPanOptions) => PanzoomEventDetail;
  reset: (resetOptions?: PanzoomPanOptions) => PanzoomEventDetail;
  resetStyle: () => void;
  setOptions: (options?: PanzoomOptions) => void;
  zoom: (scale: number, zoomOptions?: PanzoomZoomOptions) => PanzoomEventDetail;
  zoomIn: (zoomOptions?: PanzoomZoomOptions) => PanzoomEventDetail;
  zoomOut: (zoomOptions?: PanzoomZoomOptions) => PanzoomEventDetail;
  zoomToPoint: (
    scale: number,
    point: Pick<MouseEvent, "clientX" | "clientY">,
    zoomOptions?: PanzoomZoomOptions,
    originalEvent?: Event,
  ) => PanzoomEventDetail;
  zoomWithWheel: (event: WheelEvent, zoomOptions?: PanzoomZoomOptions) => PanzoomEventDetail;
}
