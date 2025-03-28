import { z } from "zod";

export enum SoundSetting {
  Off = "Off",
  On = "On",
}

export const soundSettingSchema = z.nativeEnum(SoundSetting) as const satisfies z.ZodType<SoundSetting>;
