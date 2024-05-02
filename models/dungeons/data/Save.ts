import { Player, playerSchema } from "@/models/dungeons/data/player/Player";
import { InitialWorld, worldSchema } from "@/models/dungeons/data/world/World";
import { z } from "zod";

export class Save {
  world = structuredClone(InitialWorld);
  player = new Player();
}

export const saveSchema = z.object({
  world: worldSchema,
  player: playerSchema,
}) satisfies z.ZodType<Save>;
