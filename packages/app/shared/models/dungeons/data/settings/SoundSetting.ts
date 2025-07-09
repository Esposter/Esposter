import { z } from "zod";

export enum SoundSetting {
  Off = "Off",
  On = "On",
}

export const soundSettingSchema = z.enum(SoundSetting) satisfies z.ZodType<SoundSetting>;
