import type { CityArea } from "#src/models/genshinAssets/world/CityArea";
import type { CityAreaCandidate } from "#src/models/genshinAssets/world/CityAreaCandidate";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { getNamedRawArgs } from "#src/services/genshinAssets/shared/getNamedRawArgs";
import { runAnimeStudioBelowNormal } from "#src/services/genshinAssets/shared/runAnimeStudioBelowNormal";
import { CITY_AREA_EXPORTS_DIRECTORY } from "#src/services/genshinAssets/world/constants";
import { parseStreamingIndex } from "#src/services/genshinAssets/world/parseStreamingIndex";
import { parseStreamingPlacements } from "#src/services/genshinAssets/world/parseStreamingPlacements";
import { toCityArea } from "#src/services/genshinAssets/world/toCityArea";
import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";

interface ExportRequest {
  block: string;
  names: Set<string>;
  type: AssetType;
}

// Every candidate's blob and index exported raw, one AnimeStudio run per block and type so each block is read once,
// Then each blob's placements read and its extent taken. Only the StreamGen blobs and their indexes are exported
export const extractCityAreas = async (candidates: readonly CityAreaCandidate[]): Promise<CityArea[]> => {
  const requests = new Map<string, ExportRequest>();
  const addRequest = (block: string, type: AssetType, name: string): void => {
    const key = `${block}\t${type}`;
    const request = requests.get(key) ?? { block, names: new Set<string>(), type };
    request.names.add(name);
    requests.set(key, request);
  };
  for (const { blob, index } of candidates) {
    addRequest(blob.block, AssetType.MiHoYoBinData, blob.name);
    addRequest(index.block, AssetType.MonoBehaviour, index.name);
  }
  // Cleared first, so a name AnimeStudio exports nothing for is never read from an earlier run's leftovers
  await rm(CITY_AREA_EXPORTS_DIRECTORY, { force: true, recursive: true });
  for (const { block, names, type } of requests.values())
    await runAnimeStudioBelowNormal(getNamedRawArgs(block, type, [...names], CITY_AREA_EXPORTS_DIRECTORY));
  const areas: CityArea[] = [];
  for (const { blob, code, index } of candidates) {
    const [blobBytes, indexBytes] = await Promise.all([
      readFile(join(CITY_AREA_EXPORTS_DIRECTORY, AssetType.MiHoYoBinData, `${blob.name}.dat`)),
      readFile(join(CITY_AREA_EXPORTS_DIRECTORY, AssetType.MonoBehaviour, `${index.name}.dat`)),
    ]);
    const area = toCityArea(code, parseStreamingPlacements(blobBytes, parseStreamingIndex(indexBytes)));
    if (area) areas.push(area);
  }
  await rm(CITY_AREA_EXPORTS_DIRECTORY, { force: true, recursive: true });
  return areas;
};
