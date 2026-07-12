import type { Save } from "#shared/models/dungeons/data/Save";
import type { Stats } from "#shared/models/dungeons/monster/Stats";
import type { ToData } from "@esposter/shared";

import { saveSchema } from "#shared/models/dungeons/data/Save";
import { getInitialSettings, settingsSchema } from "#shared/models/dungeons/data/settings/Settings";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { getMonsterData } from "#shared/services/dungeons/monster/getMonsterData";
import { createUniqueArraySchema, takeOne } from "@esposter/shared";
import { z } from "zod";

export class Dungeons extends AItemEntity {
  save?: Save;
  settings = getInitialSettings();

  constructor(init?: Partial<Dungeons> & { saves?: Save[] }) {
    super();
    if (!init) return;

    const { saves, ...rest } = init;
    Object.assign(this, rest);
    // Legacy blobs stored a multi-save array that only ever grew one slot — take its first entry
    if (!this.save && saves && saves.length > 0) this.save = takeOne(saves);
    // Legacy saves also predate the defense stat — default it from the species data
    if (this.save)
      for (const { key, stats } of this.save.player.monsters) {
        const legacyStats: Partial<Stats> = stats;
        legacyStats.defense ??= getMonsterData(key).stats.defense;
      }
  }
}

const baseDungeonsSchema = z.object({
  ...aItemEntitySchema.shape,
  id: z.uuid(),
  save: saveSchema.optional(),
  settings: settingsSchema,
});
// Stale clients still write the legacy multi-save shape during a deploy cycle — this arm migrates it.
// It must come first in the union: the base arm would otherwise strip the saves key and drop the legacy save.
const legacyDungeonsSchema = z
  .object({
    ...aItemEntitySchema.shape,
    id: z.uuid(),
    saves: createUniqueArraySchema(saveSchema, "tilemapKey"),
    settings: settingsSchema,
  })
  .transform(
    ({ saves, ...dungeons }): ToData<Dungeons> => (saves.length > 0 ? { ...dungeons, save: takeOne(saves) } : dungeons),
  );

export const dungeonsSchema = z.union([legacyDungeonsSchema, baseDungeonsSchema]) satisfies z.ZodType<ToData<Dungeons>>;
