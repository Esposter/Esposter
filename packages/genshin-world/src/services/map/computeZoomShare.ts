import { MAP_VIEW_METRES_MAX, MAP_VIEW_METRES_MIN } from "#src/services/map/constants";

// Where a view's metres sit on the zoom slider's track, from 0 at the closest zoom to 1 at the furthest, spaced by the
// Logarithm so each step of the slider zooms by the same share of the view
export const computeZoomShare = (metres: number): number =>
  Math.log(metres / MAP_VIEW_METRES_MIN) / Math.log(MAP_VIEW_METRES_MAX / MAP_VIEW_METRES_MIN);
