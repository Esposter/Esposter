import { STABILITY_BANDS } from "#src/services/dependencies/score/constants";
import { getBandPoints } from "#src/services/dependencies/score/getBandPoints";

export const getStabilityPoints = (releaseCount: number): number => getBandPoints(releaseCount, STABILITY_BANDS);
