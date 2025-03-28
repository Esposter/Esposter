import type { Save } from "#shared/models/dungeons/data/Save";
import type { ToData } from "#shared/models/entity/ToData";

import { saveSchema } from "#shared/models/dungeons/data/Save";
import { getInitialSettings, settingsSchema } from "#shared/models/dungeons/data/settings/Settings";
import { applyItemMetadataMixin, itemMetadataSchema } from "#shared/models/entity/ItemMetadata";
import { Serializable } from "#shared/models/entity/Serializable";
import { z } from "zod";

class BaseDungeonsGame extends Serializable {
  id: string = crypto.randomUUID();
  saves: Save[] = [];
  settings = getInitialSettings();
}
export const DungeonsGame = applyItemMetadataMixin(BaseDungeonsGame);
export type DungeonsGame = typeof DungeonsGame.prototype;

export const dungeonsGameSchema = z
  .object({
    id: z.string().uuid(),
    saves: z.array(saveSchema),
    settings: settingsSchema,
  })
  .merge(itemMetadataSchema) as const satisfies z.ZodType<ToData<DungeonsGame>>;
