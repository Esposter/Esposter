import type { TMXLayer } from "@/lib/tmxParser/models/tmx/TMXLayer";
import type { TMXNode } from "@/lib/tmxParser/models/tmx/TMXNode";
import type { TMXParsedLayer } from "@/lib/tmxParser/models/tmx/TMXParsedLayer";
import { getAttributes } from "@/lib/tmxParser/util/getAttributes";
import { parseObject } from "@/lib/tmxParser/util/parseObject";
import { parseProperties } from "@/lib/tmxParser/util/parseProperties";

export const parseLayer = (node: TMXNode<TMXLayer>): TMXParsedLayer => {
  const { $, image, object, properties } = node;
  const layer: Record<string, unknown> = {
    type: node["#name"],
    visible: 1,
    properties: parseProperties(properties),
  };
  if (image) layer.image = Object.assign({}, ...getAttributes(image[0].$));
  if (object) layer.objects = object.map((o) => parseObject(o));
  return Object.assign(layer, ...getAttributes($));
};
