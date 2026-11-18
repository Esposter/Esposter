import type { PlaceLandmark } from "#src/models/world/PlaceLandmark";
import type { GroundPoint } from "genshin-engine";

import { computeGroundDistance } from "genshin-engine";

// The distance in metres across the ground from a landmark to a point on it
export const computeLandmarkDistance = ({ position }: PlaceLandmark, point: GroundPoint): number =>
  computeGroundDistance(position, point);
