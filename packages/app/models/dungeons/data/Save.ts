import { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";
import { Player, playerSchema } from "@/models/dungeons/data/player/Player";
import { getInitialWorld, worldSchema } from "@/models/dungeons/data/world/World";
import { tilemapKeySchema } from "@/models/dungeons/keys/TilemapKey";
import { z } from "zod";

export class Save {
  player = new Player();
  tilemapKey = TilemapKey.Home;
  world = getInitialWorld();
}

export const saveSchema = z.object({
  player: playerSchema,
  tilemapKey: tilemapKeySchema,
  world: worldSchema,
}) satisfies z.ZodType<Save>;
