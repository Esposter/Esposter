import { Player, playerSchema } from "@/models/dungeons/Player";
import { ApplyItemMetadataMixin, itemMetadataSchema } from "@/models/shared/ItemMetadata";
import { z } from "zod";

class BaseGame {
  id = crypto.randomUUID() as string;
  player = new Player();

  constructor(init?: Partial<BaseGame>) {
    Object.assign(this, init);
  }

  toJSON() {
    return JSON.stringify({ ...this });
  }
}

export type Game = typeof Game.prototype;
export const Game = ApplyItemMetadataMixin(BaseGame);

export const gameSchema = z
  .object({
    id: z.string().uuid(),
    player: playerSchema,
  })
  .merge(itemMetadataSchema) satisfies z.ZodType<Omit<Game, "toJSON">>;
