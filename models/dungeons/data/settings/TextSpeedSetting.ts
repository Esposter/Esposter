import { z } from "zod";

export enum TextSpeedSetting {
  Slow = "Slow",
  Mid = "Mid",
  Fast = "Fast",
}

export const textSpeedSettingSchema = z.nativeEnum(TextSpeedSetting) satisfies z.ZodType<TextSpeedSetting>;
