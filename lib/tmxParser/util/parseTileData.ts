import type { TMXNode } from "@/lib/tmxParser/models/tmx/TMXNode";
import type { TMXObject } from "@/lib/tmxParser/models/tmx/TMXObject";
import type { TMXTile } from "@/lib/tmxParser/models/tmx/TMXTile";
import { getAttributes } from "@/lib/tmxParser/util/getAttributes";
import { parseObjectData } from "@/lib/tmxParser/util/parseObjectData";

export const parseTileData = (node: TMXNode<TMXTile>): TMXTile => {
  const { $, animation, objectgroup } = node;
  const tileData: Record<string, unknown> = {};
  if (Array.isArray(animation))
    tileData.animation = {
      frames: animation[0].frame.map(({ $ }: TMXNode<TMXObject>) => Object.assign({}, ...getAttributes($))),
    };
  if (Array.isArray(objectgroup) && Array.isArray(objectgroup[0].object))
    tileData.objects = objectgroup[0].object.map((o: TMXNode<TMXObject>) => parseObjectData(o));
  return Object.assign(tileData, ...getAttributes($));
};
