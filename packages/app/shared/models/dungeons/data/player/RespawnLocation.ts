import type { Position } from "grid-engine";

import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import { directionSchema } from "#shared/models/dungeons/data/player/Direction";
import { positionSchema } from "#shared/models/dungeons/data/player/Position";
import { tilemapKeySchema } from "#shared/models/dungeons/keys/TilemapKey";
import { Direction } from "grid-engine";
import { z } from "zod";

export class RespawnLocation {
  direction = Direction.UP;
  position: Position = { x: 9, y: 4 };
  tilemapKey = TilemapKey.HomeBuilding1;
}

export const respawnLocationSchema = z.object({
  direction: directionSchema,
  position: positionSchema,
  tilemapKey: tilemapKeySchema,
}) satisfies z.ZodType<RespawnLocation>;
