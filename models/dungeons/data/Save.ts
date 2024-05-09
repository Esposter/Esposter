import { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";
import { Player, playerSchema } from "@/models/dungeons/data/player/Player";
import { InitialWorld, worldSchema } from "@/models/dungeons/data/world/World";
import { tilemapKeySchema } from "@/models/dungeons/keys/TilemapKey";
import { z } from "zod";

export class Save {
  player = new Player();
  world = structuredClone(InitialWorld);
  tilemapKey = TilemapKey.Home;
}

export const saveSchema = z.object({
  player: playerSchema,
  world: worldSchema,
  tilemapKey: tilemapKeySchema,
}) satisfies z.ZodType<Save>;
