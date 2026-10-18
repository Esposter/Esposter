import type { TimeTrialMarker } from "#src/models/puzzle/TimeTrialMarker";
import type { GroundPoint } from "genshin-engine";

import { TIME_TRIAL_MARKER_REACH_DISTANCE } from "#src/services/puzzle/constants";

// Whether the character stands within reach of a Time Trial Challenge's marker on the ground, where its challenge starts
export const checkIsTimeTrialMarkerReached = (marker: TimeTrialMarker, position: GroundPoint): boolean =>
  Math.hypot(position.x - marker.position.x, position.z - marker.position.z) <= TIME_TRIAL_MARKER_REACH_DISTANCE;
