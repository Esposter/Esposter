import { Player, playerSchema } from "@/models/dungeons/Player";
import { State, stateSchema } from "@/models/dungeons/State";
import { ApplyItemMetadataMixin, itemMetadataSchema } from "@/models/shared/ItemMetadata";
import { z } from "zod";

class BaseGame {
  id = crypto.randomUUID() as string;
  round = 0;
  state = State.Battle;
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

export const gameSchema = itemMetadataSchema.merge(
  z.object({
    id: z.string().uuid(),
    round: z.number().int().nonnegative(),
    state: stateSchema,
    player: playerSchema,
  }),
) satisfies z.ZodType<Omit<Game, "toJSON">>;
