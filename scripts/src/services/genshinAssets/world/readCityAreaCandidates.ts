import type { IndexedAsset } from "#src/models/genshinAssets/shared/IndexedAsset";
import type { CityAreaCandidate } from "#src/models/genshinAssets/world/CityAreaCandidate";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { readIndexedAssets } from "#src/services/genshinAssets/shared/readIndexedAssets";
import { CITY_AREA_PREFIX, CITY_AREA_SUFFIX, STREAM_INDEX_SUFFIX } from "#src/services/genshinAssets/world/constants";
import { getCityStreamName } from "#src/services/genshinAssets/world/getCityStreamName";
import { getStreamBlobName } from "#src/services/genshinAssets/world/getStreamBlobName";

const CITY_INDEX_SUFFIX = `${CITY_AREA_SUFFIX}${STREAM_INDEX_SUFFIX}`;
const checkIsCityIndexName = (name: string): boolean =>
  name.startsWith(CITY_AREA_PREFIX) && name.endsWith(CITY_INDEX_SUFFIX);
const getCityCode = (indexName: string): string => indexName.slice(CITY_AREA_PREFIX.length, -CITY_INDEX_SUFFIX.length);
const getCityBlobName = (code: string): string => getStreamBlobName(getCityStreamName(code));

// Every `Area_<code>_City_Index` the asset index names, each with its code and its blob's index entry. Every one is a
// Candidate, whether or not a region names it: the game keeps one blob per city area
export const readCityAreaCandidates = async (): Promise<CityAreaCandidate[]> => {
  const indexes = new Map<string, IndexedAsset>();
  for (const index of await readIndexedAssets(
    ({ name, type }) => type === AssetType.MonoBehaviour && checkIsCityIndexName(name),
  ))
    if (!indexes.has(index.name)) indexes.set(index.name, index);
  const blobNames = new Set(Array.from(indexes.values(), ({ name }) => getCityBlobName(getCityCode(name))));
  const blobs = new Map<string, IndexedAsset>();
  for (const blob of await readIndexedAssets(
    ({ name, type }) => type === AssetType.MiHoYoBinData && blobNames.has(name),
  ))
    if (!blobs.has(blob.name)) blobs.set(blob.name, blob);
  return [...indexes.values()].flatMap((index) => {
    const code = getCityCode(index.name);
    const blob = blobs.get(getCityBlobName(code));
    return blob ? [{ blob, code, index }] : [];
  });
};
