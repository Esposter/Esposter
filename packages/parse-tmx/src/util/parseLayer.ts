import type { TMXLayerNode } from "#src/models/tmx/node/TMXLayerNode";
import type { TMXLayerParsed } from "#src/models/tmx/parsed/TMXLayerParsed";

import { cloneNodeWithType } from "#src/util/cloneNodeWithType";
import { parseObject } from "#src/util/parseObject";
import { parseProperties } from "#src/util/parseProperties";
import { takeOne } from "@esposter/shared";

export const parseLayer = (node: TMXLayerNode): TMXLayerParsed => {
  const { image, object, properties } = node;
  const layer = cloneNodeWithType<TMXLayerParsed>(node);
  layer.visible = 1;
  if (image) layer.image = structuredClone(takeOne(image).$);
  if (object) layer.objects = object.map((o) => parseObject(o));
  if (properties) layer.properties = parseProperties(properties);
  return layer;
};
