import type { TMXGroupLayerParsed, TMXLayerParsed } from "parse-tmx";

import { LayerType } from "#scripts/tiled/models/LayerType";

// The parser types a layer's kind as a string, so a group is recognised by its kind here, which is what narrows it to
// The layers it holds
const checkIsGroupLayer = (layer: TMXGroupLayerParsed | TMXLayerParsed): layer is TMXGroupLayerParsed =>
  layer.type === LayerType.Group;

export const createLayerNames = (layers: (TMXGroupLayerParsed | TMXLayerParsed)[], filepath = "") => {
  const objectgroupNames: string[] = [];
  const layerNames: string[] = [];

  for (const layer of layers) {
    const layerName = `${filepath}${layer.name}`;
    if (checkIsGroupLayer(layer)) {
      const result = createLayerNames(layer.layers, `${layerName}/`);
      objectgroupNames.push(...result.objectgroupNames);
      layerNames.push(...result.layerNames);
      continue;
    }
    switch (layer.type) {
      case LayerType.Layer:
        layerNames.push(layerName);
        break;
      case LayerType.ObjectGroup:
        objectgroupNames.push(layerName);
        break;
      default:
        break;
    }
  }

  return { layerNames, objectgroupNames };
};
