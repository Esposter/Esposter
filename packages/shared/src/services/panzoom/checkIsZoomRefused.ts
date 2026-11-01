import type { PanzoomZoomOptions } from "#src/models/panzoom/PanzoomZoomOptions";

// A zoom the options refuse: zoom is disabled, and the call does not force it through
export const checkIsZoomRefused = ({ disableZoom, force }: PanzoomZoomOptions): boolean =>
  Boolean(disableZoom) && !force;
