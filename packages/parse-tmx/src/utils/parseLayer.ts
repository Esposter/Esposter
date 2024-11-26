import type { TMXLayerNode } from "@/models/tmx/node/TMXLayerNode";
import type { TMXLayerParsed } from "@/models/tmx/parsed/TMXLayerParsed";

import { parseObject } from "@/utils/parseObject";
import { parseProperties } from "@/utils/parseProperties";

export const parseLayer = (node: TMXLayerNode): TMXLayerParsed => {
  const { $, image, object, properties } = node;
  const layer = structuredClone($) as TMXLayerParsed;
  layer.type = node["#name"] as string;
  layer.visible = 1;
  if (image) layer.image = structuredClone(image[0].$);
  if (object) layer.objects = object.map((o) => parseObject(o));
  if (properties) layer.properties = parseProperties(properties);
  return layer;
};
