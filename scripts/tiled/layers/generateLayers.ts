import { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";
import { parseTmx } from "@/lib/tmxParser/parseTmx";
import { DIRECTORY } from "@/scripts/tiled/layers/constants";
import { generateLayerNames } from "@/scripts/tiled/layers/generateLayerNames";
import { LayerType } from "@/scripts/tiled/models/LayerType";
import { getTilemapDirectory } from "@/scripts/util/getTilemapDirectory";
import { readFile } from "node:fs/promises";

export const generateLayers = async () => {
  const tilemapLayerMembersMap = new Map<TilemapKey, Map<Exclude<LayerType, LayerType.objectgroup>, Set<string>>>();
  const objectgroupNameMembers = new Set<string>();

  for (const tilemapKey of Object.values(TilemapKey)) {
    const tmx = await parseTmx(
      await readFile(`assets/dungeons/scene/world/${getTilemapDirectory(tilemapKey)}/index.tmx`, "utf-8"),
    );

    for (const layerType of Object.values(LayerType)) {
      if (layerType === LayerType.objectgroup) {
        for (const layer of tmx.map.layers) {
          if (layer.type !== layerType) continue;
          objectgroupNameMembers.add(layer.name);
        }
        continue;
      }

      const members = new Set<string>();
      for (const layer of tmx.map.layers) {
        if (layer.type !== layerType) continue;
        members.add(layer.name);
      }

      const layerMembersMap = tilemapLayerMembersMap.get(tilemapKey);
      if (!layerMembersMap) {
        tilemapLayerMembersMap.set(tilemapKey, new Map([[layerType, members]]));
        continue;
      }
      layerMembersMap.set(layerType, members);
    }
  }

  const promises: Promise<void>[] = [];
  for (const [tilemapKey, layerMembersMap] of tilemapLayerMembersMap.entries()) {
    const directory = `${DIRECTORY}/${getTilemapDirectory(tilemapKey)}`;
    for (const [layerType, layerMembers] of layerMembersMap.entries())
      promises.push(generateLayerNames(directory, layerType, layerMembers));
  }
  // We need to process object layers later and
  // merge object layers from all tilemaps together because:
  // 1. They MUST have the same behaviour across maps
  // 2. We should NOT be duplicating this behavioural code in our typescript code
  promises.push(generateLayerNames(DIRECTORY, LayerType.objectgroup, objectgroupNameMembers));
  await Promise.all(promises);
};
