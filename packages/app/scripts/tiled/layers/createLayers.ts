import type { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import type { LayerData } from "@@/scripts/tiled/models/LayerData";

import { DIRECTORY } from "@@/scripts/tiled/layers/constants";
import { createLayerNames } from "@@/scripts/tiled/layers/createLayerNames";
import { createLayerNamesFile } from "@@/scripts/tiled/layers/createLayerNamesFile";
import { LayerType } from "@@/scripts/tiled/models/LayerType";
import { getTilemapDirectory } from "@@/scripts/tiled/util/getTilemapDirectory";

export const createLayers = async (layersData: LayerData[]) => {
  const tilemapLayerNamesMap = new Map<TilemapKey, string[]>();
  const objectgroupNames: string[] = [];

  for (const { key, layers } of layersData) {
    const layerNames: string[] = [];
    const result = createLayerNames(layers);
    objectgroupNames.push(...result.objectgroupNames);
    layerNames.push(...result.layerNames);
    tilemapLayerNamesMap.set(key, layerNames);
  }

  const promises: Promise<void>[] = [];
  for (const [tilemapKey, layerNames] of tilemapLayerNamesMap.entries()) {
    const directory = `${DIRECTORY}/${getTilemapDirectory(tilemapKey)}`;
    promises.push(createLayerNamesFile(directory, LayerType.layer, layerNames));
  }
  // We need to process object layers later and
  // merge object layers from all tilemaps together because:
  // 1. They MUST have the same behaviour across maps
  // 2. We should NOT be duplicating this behavioural code in our typescript code
  promises.push(createLayerNamesFile(DIRECTORY, LayerType.objectgroup, [...new Set(objectgroupNames)]));
  await Promise.all(promises);
};
