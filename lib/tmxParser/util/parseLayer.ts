import type { TMXLayer } from "@/lib/tmxParser/models/tmx/TMXLayer";
import type { TMXNode } from "@/lib/tmxParser/models/tmx/TMXNode";
import type { TMXObject } from "@/lib/tmxParser/models/tmx/TMXObject";
import type { TMXParsedLayer } from "@/lib/tmxParser/models/tmx/TMXParsedLayer";
import { getAttributes } from "@/lib/tmxParser/util/getAttributes";
import { getFlattenedProperties } from "@/lib/tmxParser/util/getFlattenedProperties";
import { parseObject } from "@/lib/tmxParser/util/parseObject";

export const parseLayer = (node: TMXNode<TMXLayer>): TMXParsedLayer => {
  const { $, image, object, properties } = node;
  return Object.assign(
    {
      type: node["#name"],
      visible: 1,
      ...(Array.isArray(image) && { image: Object.assign({}, ...getAttributes(image[0].$)) }),
      ...(Array.isArray(object) && {
        objects: object.map((o: TMXNode<TMXObject>) => parseObject(o)),
      }),
      ...getFlattenedProperties(properties),
    },
    ...getAttributes($),
  );
};
