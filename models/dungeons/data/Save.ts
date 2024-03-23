import { Player, playerSchema } from "@/models/dungeons/data/Player";
import { z } from "zod";

export class Save {
  player = new Player();
}

export const saveSchema = z.object({
  player: playerSchema,
}) satisfies z.ZodType<Save>;
