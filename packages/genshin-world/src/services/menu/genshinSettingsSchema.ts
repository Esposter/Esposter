import type { GenshinSettings } from "#src/models/menu/GenshinSettings";

import {
  CAMERA_DISTANCE_RANGE,
  CAMERA_SENSITIVITY_RANGE,
  VOLUME_LEVEL_MAXIMUM,
  VOLUME_LEVEL_MINIMUM,
} from "#src/services/menu/constants";
import { QualityTier } from "genshin-engine";
import { GameLanguage } from "genshin-text";
import { z } from "zod";

const volumeLevelSchema = z.int().min(VOLUME_LEVEL_MINIMUM).max(VOLUME_LEVEL_MAXIMUM);
const sensitivitySchema = z.int().min(CAMERA_SENSITIVITY_RANGE.min).max(CAMERA_SENSITIVITY_RANGE.max);
const distanceSchema = z.number().min(CAMERA_DISTANCE_RANGE.min).max(CAMERA_DISTANCE_RANGE.max);
// Every field is optional, since a device keeps only what it has chosen and a field it has not is the default
export const genshinSettingsSchema = z
  .object({
    defaultDistance: distanceSchema,
    horizontalSensitivity: sensitivitySchema,
    language: z.enum(GameLanguage),
    musicVolume: volumeLevelSchema,
    qualityTier: z.enum(QualityTier),
    sfxVolume: volumeLevelSchema,
    slopePitch: z.boolean(),
    verticalSensitivity: sensitivitySchema,
    volume: volumeLevelSchema,
  })
  .partial() satisfies z.ZodType<Partial<GenshinSettings>>;
