import { z } from "zod/v4";

export enum SoundSetting {
  Off = "Off",
  On = "On",
}

export const soundSettingSchema = z.enum(SoundSetting) satisfies z.ZodType<SoundSetting>;
