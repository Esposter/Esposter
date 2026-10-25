import { CITY_AREA_PREFIX, CITY_INDEX_SUFFIX } from "#src/services/genshinAssets/world/constants";

export const checkIsCityIndexName = (name: string): boolean =>
  name.startsWith(CITY_AREA_PREFIX) && name.endsWith(CITY_INDEX_SUFFIX);
