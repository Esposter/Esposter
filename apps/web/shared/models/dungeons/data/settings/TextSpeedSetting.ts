import { z } from "zod";

export enum TextSpeedSetting {
  Fast = "Fast",
  Mid = "Mid",
  Slow = "Slow",
}

export const textSpeedSettingSchema = z.enum(TextSpeedSetting) satisfies z.ZodType<TextSpeedSetting>;
