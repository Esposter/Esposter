import type { CityAreaCandidate } from "#src/models/genshinAssets/world/CityAreaCandidate";
import type { IndexedAsset } from "#src/models/recreation/animeStudio/IndexedAsset";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { GENSHIN_ANIMESTUDIO_OPTIONS } from "#src/services/genshinAssets/shared/constants";
import { checkIsCityIndexName } from "#src/services/genshinAssets/world/checkIsCityIndexName";
import { getCityBlobName } from "#src/services/genshinAssets/world/getCityBlobName";
import { getCityCode } from "#src/services/genshinAssets/world/getCityCode";
import { readIndexedAssets } from "#src/services/recreation/animeStudio/readIndexedAssets";

// Every `Area_<code>_City_Index` the asset index names, each with its code and its blob's index entry. Every one is a
// Candidate, whether or not a region names it: the game keeps one blob per city area
export const readCityAreaCandidates = async (): Promise<CityAreaCandidate[]> => {
  const indexes = new Map<string, IndexedAsset>();
  for (const index of await readIndexedAssets(
    ({ name, type }) => type === AssetType.MonoBehaviour && checkIsCityIndexName(name),
    GENSHIN_ANIMESTUDIO_OPTIONS,
  ))
    if (!indexes.has(index.name)) indexes.set(index.name, index);
  const blobNames = new Set(Array.from(indexes.values(), ({ name }) => getCityBlobName(getCityCode(name))));
  const blobs = new Map<string, IndexedAsset>();
  for (const blob of await readIndexedAssets(
    ({ name, type }) => type === AssetType.MiHoYoBinData && blobNames.has(name),
    GENSHIN_ANIMESTUDIO_OPTIONS,
  ))
    if (!blobs.has(blob.name)) blobs.set(blob.name, blob);
  return [...indexes.values()].flatMap((index) => {
    const code = getCityCode(index.name);
    const blob = blobs.get(getCityBlobName(code));
    return blob ? [{ blob, code, index }] : [];
  });
};
