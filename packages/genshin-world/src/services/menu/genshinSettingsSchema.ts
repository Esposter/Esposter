import type { GenshinSettings } from "#src/models/menu/GenshinSettings";

import { VOLUME_LEVEL_MAXIMUM, VOLUME_LEVEL_MINIMUM } from "#src/services/menu/constants";
import { QualityTier } from "genshin-engine";
import { GameLanguage } from "genshin-text";
import { z } from "zod";

const volumeLevelSchema = z.int().min(VOLUME_LEVEL_MINIMUM).max(VOLUME_LEVEL_MAXIMUM);
// Every field is optional, since a device keeps only what it has chosen and a field it has not is the default
export const genshinSettingsSchema = z
  .object({
    language: z.enum(GameLanguage),
    musicVolume: volumeLevelSchema,
    qualityTier: z.enum(QualityTier),
    sfxVolume: volumeLevelSchema,
    volume: volumeLevelSchema,
  })
  .partial() satisfies z.ZodType<Partial<GenshinSettings>>;
