import { OUTCROP_CAMP_ID_PREFIX } from "#src/services/leyLine/constants";

// The id of the camp a fight spawns at a place: the prefix and the place's id, so the camp is named by its place
export const computeOutcropCampId = (placeId: number): string => `${OUTCROP_CAMP_ID_PREFIX}-${placeId}`;
