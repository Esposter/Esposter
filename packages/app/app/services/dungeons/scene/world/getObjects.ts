import type { Position } from "grid-engine";
import type { Tilemaps, Types } from "phaser";
import type { SetRequired } from "type-fest";

import { getObjectUnitPosition } from "@/services/dungeons/tilemap/getObjectUnitPosition";

export const getObjects = (objectLayer: Tilemaps.ObjectLayer) => {
  const objects: SetRequired<Types.Tilemaps.TiledObject, keyof Position>[] = [];

  for (const { x, y, ...rest } of objectLayer.objects) {
    if (!(x && y)) continue;
    objects.push({ ...getObjectUnitPosition({ x, y }), ...rest });
  }

  return objects;
};
