import type { TMXLayerNode } from "@/models/tmx/node/TMXLayerNode";
import type { TMXLayerParsed } from "@/models/tmx/parsed/TMXLayerParsed";

import { parseObject } from "@/util/parseObject";
import { parseProperties } from "@/util/parseProperties";
import { takeOne } from "@esposter/shared";

export const parseLayer = (node: TMXLayerNode): TMXLayerParsed => {
  const { $, image, object, properties } = node;
  const layer = structuredClone($) as TMXLayerParsed;
  layer.type = node["#name"] as string;
  layer.visible = 1;
  if (image) layer.image = structuredClone(takeOne(image).$);
  if (object) layer.objects = object.map((o) => parseObject(o));
  if (properties) layer.properties = parseProperties(properties);
  return layer;
};
