import { CITY_AREA_PREFIX, CITY_INDEX_SUFFIX } from "#src/services/genshinAssets/world/constants";

export const getCityCode = (indexName: string): string =>
  indexName.slice(CITY_AREA_PREFIX.length, -CITY_INDEX_SUFFIX.length);
