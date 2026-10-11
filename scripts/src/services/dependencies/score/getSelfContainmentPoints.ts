import { SELF_CONTAINMENT_BANDS } from "#src/services/dependencies/score/constants";
import { getBandPoints } from "#src/services/dependencies/score/getBandPoints";

export const getSelfContainmentPoints = (dependencyCount: number): number =>
  getBandPoints(dependencyCount, SELF_CONTAINMENT_BANDS);
