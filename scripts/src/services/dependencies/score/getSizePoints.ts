import { SIZE_BANDS } from "#src/services/dependencies/score/constants";
import { getBandPoints } from "#src/services/dependencies/score/getBandPoints";

export const getSizePoints = (sourceLines: number): number => getBandPoints(sourceLines, SIZE_BANDS);
