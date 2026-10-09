import { computeZoomMetresAtShare } from "#src/services/map/computeZoomMetresAtShare";
import { computeZoomShare } from "#src/services/map/computeZoomShare";
import { MAP_WHEEL_ZOOM_SHARE } from "#src/services/map/constants";

// The metres a view shows after a wheel turn of deltaY, a scroll down zooming out, along the same track the slider moves on
export const computeWheelZoomMetres = (metres: number, deltaY: number): number =>
  computeZoomMetresAtShare(computeZoomShare(metres) + deltaY * MAP_WHEEL_ZOOM_SHARE);
