import { applyItemMetadataMixin, itemMetadataSchema } from "@/models/shared/ItemMetadata";
import { z } from "zod";

class BaseGame {
  id = crypto.randomUUID() as string;

  constructor(init?: Partial<BaseGame>) {
    Object.assign(this, init);
  }

  toJSON() {
    return JSON.stringify({ ...this });
  }
}

export type Game = typeof Game.prototype;
export const Game = applyItemMetadataMixin(BaseGame);

export const gameSchema = z
  .object({
    id: z.string().uuid(),
  })
  .merge(itemMetadataSchema) satisfies z.ZodType<Omit<Game, "toJSON">>;
