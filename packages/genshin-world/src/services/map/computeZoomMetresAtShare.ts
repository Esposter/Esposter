import { MAP_VIEW_METRES_MAX, MAP_VIEW_METRES_MIN } from "#src/services/map/constants";

// The metres a view shows at a place on the zoom slider's track, the reverse of its share on the logarithm. A place past
// Either end of the track is that end
export const computeZoomMetresAtShare = (share: number): number =>
  MAP_VIEW_METRES_MIN * (MAP_VIEW_METRES_MAX / MAP_VIEW_METRES_MIN) ** Math.min(1, Math.max(0, share));
