import { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";
import { directionSchema } from "@/models/dungeons/data/player/Direction";
import { positionSchema } from "@/models/dungeons/data/player/Position";
import { tilemapKeySchema } from "@/models/dungeons/keys/TilemapKey";
import { Direction } from "grid-engine";
import type { Position } from "grid-engine";
import { z } from "zod";

export class RespawnLocation {
  tilemapKey = TilemapKey.HomeBuilding1;
  position: Position = { x: 9, y: 4 };
  direction = Direction.UP;
}

export const respawnLocationSchema = z.object({
  tilemapKey: tilemapKeySchema,
  position: positionSchema,
  direction: directionSchema,
}) satisfies z.ZodType<RespawnLocation>;
