import { z } from "zod";

export const SoundSetting = { Off: "Off", On: "On" } as const;
export type SoundSetting = (typeof SoundSetting)[keyof typeof SoundSetting];

export const soundSettingSchema = z.enum(SoundSetting) satisfies z.ZodType<SoundSetting>;
