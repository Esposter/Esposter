import type { TMXLayer } from "@/lib/tmxParser/models/tmx/TMXLayer";
import type { TMXNode } from "@/lib/tmxParser/models/tmx/TMXNode";
import type { TMXObject } from "@/lib/tmxParser/models/tmx/TMXObject";
import { getAttributes } from "@/lib/tmxParser/util/getAttributes";
import { getFlattenedProperties } from "@/lib/tmxParser/util/getFlattenedProperties";
import { parseObjectData } from "@/lib/tmxParser/util/parseObjectData";

export const parseLayer = (node: TMXNode<TMXLayer>): TMXLayer => {
  const { $, image, object, properties } = node;
  return Object.assign(
    {
      type: node["#name"],
      visible: 1,
      ...(Array.isArray(image) && { image: Object.assign({}, ...getAttributes(image[0].$)) }),
      ...(Array.isArray(object) && {
        objects: object.map((o: TMXNode<TMXObject>) => parseObjectData(o)),
      }),
      ...getFlattenedProperties(properties),
    },
    ...getAttributes($),
  );
};
