import { CITY_AREA_PREFIX, CITY_AREA_SUFFIX } from "#src/services/genshinAssets/world/constants";

// The name of a city area's StreamGen blob, from the code the area is known by (`Area_<code>_City`)
export const getCityStreamName = (code: string): string => `${CITY_AREA_PREFIX}${code}${CITY_AREA_SUFFIX}`;
