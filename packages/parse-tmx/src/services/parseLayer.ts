import type { TMXLayerNode } from "#src/models/tmx/node/TMXLayerNode";
import type { TMXLayerParsed } from "#src/models/tmx/parsed/TMXLayerParsed";

import { cloneNodeWithType } from "#src/services/cloneNodeWithType";
import { parseObject } from "#src/services/parseObject";
import { parseProperties } from "#src/services/parseProperties";
import { takeOne } from "@esposter/shared";

export const parseLayer = (node: TMXLayerNode): TMXLayerParsed => {
  const { image, object, properties } = node;
  const layer = cloneNodeWithType<TMXLayerParsed>(node);
  if (image) layer.image = structuredClone(takeOne(image).$);
  if (object) layer.objects = object.map((objectNode) => parseObject(objectNode));
  if (properties) layer.properties = parseProperties(properties);
  return layer;
};
