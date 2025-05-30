import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import { Player, playerSchema } from "#shared/models/dungeons/data/player/Player";
import { getInitialWorld, worldSchema } from "#shared/models/dungeons/data/world/World";
import { tilemapKeySchema } from "#shared/models/dungeons/keys/TilemapKey";
import { z } from "zod/v4";

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
