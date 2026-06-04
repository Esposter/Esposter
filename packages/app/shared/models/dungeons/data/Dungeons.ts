import type { Save } from "#shared/models/dungeons/data/Save";
import type { ToData } from "@esposter/shared";

import { saveSchema } from "#shared/models/dungeons/data/Save";
import { getInitialSettings, settingsSchema } from "#shared/models/dungeons/data/settings/Settings";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

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
  saves: createUniqueArraySchema(saveSchema, "tilemapKey"),
  settings: settingsSchema,
}) satisfies z.ZodType<ToData<Dungeons>>;
