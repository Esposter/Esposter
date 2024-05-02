import type { Save } from "@/models/dungeons/data/Save";
import { saveSchema } from "@/models/dungeons/data/Save";
import { InitialSettings, settingsSchema } from "@/models/dungeons/data/settings/Settings";
import { applyItemMetadataMixin, itemMetadataSchema } from "@/models/shared/ItemMetadata";
import type { Except } from "type-fest";
import { z } from "zod";

class BaseGame {
  id: string = crypto.randomUUID();
  saves: Save[] = [];
  settings = structuredClone(InitialSettings);

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
    saves: z.array(saveSchema),
    settings: settingsSchema,
  })
  .merge(itemMetadataSchema) satisfies z.ZodType<Except<Game, "toJSON">>;
