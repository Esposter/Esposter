import { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";
import { getInitialWorld, worldSchema } from "@/shared/models/dungeons/data/world/World";
import { z } from "zod";

import { Player, playerSchema } from "@/shared/models/dungeons/data/player/Player";
import { tilemapKeySchema } from "@/shared/models/dungeons/keys/TilemapKey";

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
