import { z } from "zod/v4";

export enum TextSpeedSetting {
  Fast = "Fast",
  Mid = "Mid",
  Slow = "Slow",
}

export const textSpeedSettingSchema = z.enum(TextSpeedSetting) satisfies z.ZodType<TextSpeedSetting>;
