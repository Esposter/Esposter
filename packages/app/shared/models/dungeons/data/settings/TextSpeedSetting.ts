import { z } from "zod";

export enum TextSpeedSetting {
  Fast = "Fast",
  Mid = "Mid",
  Slow = "Slow",
}

export const textSpeedSettingSchema = z.nativeEnum(TextSpeedSetting) as const satisfies z.ZodType<TextSpeedSetting>;
