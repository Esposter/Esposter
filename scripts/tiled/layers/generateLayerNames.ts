import type { TMXGroupLayerParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXGroupLayerParsed";
import type { TMXLayerParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXLayerParsed";
import { LayerType } from "@/scripts/tiled/models/LayerType";

export const generateLayerNames = (layers: (TMXLayerParsed | TMXGroupLayerParsed)[], filepath = "") => {
  const objectgroupNames: string[] = [];
  const layerNames: string[] = [];

  for (const layer of layers) {
    const layerName = `${filepath}${layer.name}`;
    switch (layer.type) {
      case LayerType.objectgroup:
        objectgroupNames.push(layerName);
        break;
      case LayerType.group:
        {
          const result = generateLayerNames((layer as TMXGroupLayerParsed).layers, `${layerName}/`);
          objectgroupNames.push(...result.objectgroupNames);
          layerNames.push(...result.layerNames);
        }
        break;
      case LayerType.layer:
        layerNames.push(layerName);
        break;
      default:
        break;
    }
  }

  return { objectgroupNames, layerNames };
};
