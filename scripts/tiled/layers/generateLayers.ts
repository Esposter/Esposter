import type { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";
import { DIRECTORY } from "@/scripts/tiled/layers/constants";
import { generateLayerMembers } from "@/scripts/tiled/layers/generateLayerMembers";
import { generateLayerNames } from "@/scripts/tiled/layers/generateLayerNames";
import type { LayerData } from "@/scripts/tiled/models/LayerData";
import { LayerType } from "@/scripts/tiled/models/LayerType";
import { getTilemapDirectory } from "@/scripts/util/getTilemapDirectory";

export const generateLayers = async (layersData: LayerData[]) => {
  const tilemapLayerMembersMap = new Map<TilemapKey, string[]>();
  const objectgroupNameMembers: string[] = [];

  for (const { key, layers } of layersData) {
    const layerNameMembers: string[] = [];
    const result = generateLayerMembers(layers);
    objectgroupNameMembers.push(...result.objectgroupNameMembers);
    layerNameMembers.push(...result.layerNameMembers);
    tilemapLayerMembersMap.set(key, layerNameMembers);
  }

  const promises: Promise<void>[] = [];
  for (const [tilemapKey, layerMembers] of tilemapLayerMembersMap.entries()) {
    const directory = `${DIRECTORY}/${getTilemapDirectory(tilemapKey)}`;
    promises.push(generateLayerNames(directory, LayerType.layer, layerMembers));
  }
  // We need to process object layers later and
  // merge object layers from all tilemaps together because:
  // 1. They MUST have the same behaviour across maps
  // 2. We should NOT be duplicating this behavioural code in our typescript code
  promises.push(generateLayerNames(DIRECTORY, LayerType.objectgroup, [...new Set(objectgroupNameMembers)]));
  await Promise.all(promises);
};
