import type { Save } from "#shared/models/dungeons/data/Save";
import type { ToData } from "#shared/models/entity/ToData";

import { saveSchema } from "#shared/models/dungeons/data/Save";
import { getInitialSettings, settingsSchema } from "#shared/models/dungeons/data/settings/Settings";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { z } from "zod";

export class DungeonsGame extends AItemEntity {
  saves: Save[] = [];
  settings = getInitialSettings();
}

export const dungeonsGameSchema = aItemEntitySchema.extend(
  z.object({
    id: z.uuid(),
    saves: z.array(saveSchema),
    settings: settingsSchema,
  }),
) satisfies z.ZodType<ToData<DungeonsGame>>;
