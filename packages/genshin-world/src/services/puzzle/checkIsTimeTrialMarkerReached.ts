import type { TimeTrialMarker } from "#src/models/puzzle/TimeTrialMarker";
import type { GroundPoint } from "genshin-engine";

import { TIME_TRIAL_MARKER_REACH_DISTANCE } from "#src/services/puzzle/constants";
import { computeGroundDistance } from "genshin-engine";

// Whether the character stands within reach of a Time Trial Challenge's marker on the ground, where its challenge starts
export const checkIsTimeTrialMarkerReached = (marker: TimeTrialMarker, position: GroundPoint): boolean =>
  computeGroundDistance(position, marker.position) <= TIME_TRIAL_MARKER_REACH_DISTANCE;
