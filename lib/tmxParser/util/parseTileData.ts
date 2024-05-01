import type { TMXNode } from "@/lib/tmxParser/models/tmx/TMXNode";
import type { TMXObject } from "@/lib/tmxParser/models/tmx/TMXObject";
import type { TMXTile } from "@/lib/tmxParser/models/tmx/TMXTile";
import { getAttributes } from "@/lib/tmxParser/util/getAttributes";
import { parseObjectData } from "@/lib/tmxParser/util/parseObjectData";

export const parseTileData = (node: TMXNode<TMXTile>): TMXTile => {
  const { $, animation, objectgroup } = node;
  const obj = Array.isArray(objectgroup) && objectgroup[0].object;
  return Object.assign(
    {
      ...(Array.isArray(animation) && {
        animation: {
          frames: animation[0].frame.map(({ $ }: TMXNode<TMXObject>) => Object.assign({}, ...getAttributes($))),
        },
      }),
      ...(Array.isArray(obj) && {
        objects: obj.map((o: TMXNode<TMXObject>) => parseObjectData(o)),
      }),
    },
    ...getAttributes($),
  );
};
