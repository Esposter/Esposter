import type { Save } from "#shared/models/dungeons/data/Save";
import type { ToData } from "#shared/models/entity/ToData";

import { saveSchema } from "#shared/models/dungeons/data/Save";
import { getInitialSettings, settingsSchema } from "#shared/models/dungeons/data/settings/Settings";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { z } from "zod/v4";

export class Dungeons extends AItemEntity {
  saves: Save[] = [];
  settings = getInitialSettings();

  constructor(init?: Partial<Dungeons>) {
    super();
    Object.assign(this, init);
  }
}

export const dungeonsSchema = z.object({
  ...aItemEntitySchema.shape,
  id: z.uuid(),
  saves: saveSchema.array(),
  settings: settingsSchema,
}) satisfies z.ZodType<ToData<Dungeons>>;
