import { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";
import { positionSchema } from "@/models/dungeons/data/player/Position";
import { tilemapKeySchema } from "@/models/dungeons/keys/TilemapKey";
import type { Position } from "grid-engine";
import { z } from "zod";

export class RespawnLocation {
  tilemapKey = TilemapKey.HomeBuilding1;
  position: Position = { x: 9, y: 5 };
}

export const respawnLocationSchema = z.object({
  tilemapKey: tilemapKeySchema,
  position: positionSchema,
}) satisfies z.ZodType<RespawnLocation>;
