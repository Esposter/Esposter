import type { Save } from "@/models/dungeons/data/Save";
import type { Except } from "type-fest";

import { saveSchema } from "@/models/dungeons/data/Save";
import { getInitialSettings, settingsSchema } from "@/models/dungeons/data/settings/Settings";
import { applyItemMetadataMixin, itemMetadataSchema } from "@/shared/models/entity/ItemMetadata";
import { z } from "zod";

export type Game = typeof Game.prototype;

class BaseGame {
  id: string = crypto.randomUUID();
  saves: Save[] = [];
  settings = getInitialSettings();

  toJSON() {
    return JSON.stringify({ ...this });
  }
}
export const Game = applyItemMetadataMixin(BaseGame);

export const gameSchema = z
  .object({
    id: z.string().uuid(),
    saves: z.array(saveSchema),
    settings: settingsSchema,
  })
  .merge(itemMetadataSchema) satisfies z.ZodType<Except<Game, "toJSON">>;
