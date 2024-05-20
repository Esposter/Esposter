import { z } from "zod";

export enum SoundSetting {
  On = "On",
  Off = "Off",
}

export const soundSettingSchema = z.nativeEnum(SoundSetting) satisfies z.ZodType<SoundSetting>;
