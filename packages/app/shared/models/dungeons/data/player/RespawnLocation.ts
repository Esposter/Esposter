import type { Type } from "arktype";
import type { Position } from "grid-engine";

import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import { directionSchema } from "#shared/models/dungeons/data/player/Direction";
import { positionSchema } from "#shared/models/dungeons/data/player/Position";
import { tilemapKeySchema } from "#shared/models/dungeons/keys/TilemapKey";
import { type } from "arktype";
import { Direction } from "grid-engine";

export class RespawnLocation {
  direction = Direction.UP;
  position: Position = { x: 9, y: 4 };
  tilemapKey = TilemapKey.HomeBuilding1;
}

export const respawnLocationSchema = type({
  direction: directionSchema,
  position: positionSchema,
  tilemapKey: tilemapKeySchema,
}) satisfies Type<RespawnLocation>;
