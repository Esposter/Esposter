import type { TMXGroupLayerParsed, TMXLayerParsed } from "parse-tmx";

import { LayerType } from "@@/scripts/tiled/models/LayerType";

export const createLayerNames = (layers: (TMXGroupLayerParsed | TMXLayerParsed)[], filepath = "") => {
  const objectgroupNames: string[] = [];
  const layerNames: string[] = [];

  for (const layer of layers) {
    const layerName = `${filepath}${layer.name}`;
    switch (layer.type) {
      case LayerType.group: {
        const result = createLayerNames((layer as TMXGroupLayerParsed).layers, `${layerName}/`);
        objectgroupNames.push(...result.objectgroupNames);
        layerNames.push(...result.layerNames);
        break;
      }
      case LayerType.layer:
        layerNames.push(layerName);
        break;
      case LayerType.objectgroup:
        objectgroupNames.push(layerName);
        break;
      default:
        break;
    }
  }

  return { layerNames, objectgroupNames };
};
