import type { Save } from "#shared/models/dungeons/data/Save";
import type { ToData } from "#shared/models/entity/ToData";
import type { Type } from "arktype";

import { saveSchema } from "#shared/models/dungeons/data/Save";
import { getInitialSettings, settingsSchema } from "#shared/models/dungeons/data/settings/Settings";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { type } from "arktype";

export class DungeonsGame extends AItemEntity {
  saves: Save[] = [];
  settings = getInitialSettings();
}

export const dungeonsGameSchema = aItemEntitySchema.merge(
  type({
    id: "string.uuid.v4",
    saves: saveSchema.array(),
    settings: settingsSchema,
  }),
) satisfies Type<ToData<DungeonsGame>>;
