import type { TMXGroupLayerParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXGroupLayerParsed";
import type { TMXLayerParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXLayerParsed";
import { LayerType } from "@/scripts/tiled/models/LayerType";

export const generateLayerMembers = (layers: (TMXLayerParsed | TMXGroupLayerParsed)[], filepath = "") => {
  const objectgroupNameMembers: string[] = [];
  const layerNameMembers: string[] = [];

  for (const layer of layers) {
    const layerName = `${filepath}${layer.name}`;
    switch (layer.type) {
      case LayerType.objectgroup:
        objectgroupNameMembers.push(layerName);
        break;
      case LayerType.group:
        {
          const result = generateLayerMembers((layer as TMXGroupLayerParsed).layers, `${layerName}/`);
          objectgroupNameMembers.push(...result.objectgroupNameMembers);
          layerNameMembers.push(...result.layerNameMembers);
        }
        break;
      case LayerType.layer:
        layerNameMembers.push(layerName);
        break;
      default:
        break;
    }
  }

  return { objectgroupNameMembers, layerNameMembers };
};
