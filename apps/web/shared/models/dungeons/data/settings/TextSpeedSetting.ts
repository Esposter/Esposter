import { z } from "zod";

export const TextSpeedSetting = { Fast: "Fast", Mid: "Mid", Slow: "Slow" } as const;
export type TextSpeedSetting = (typeof TextSpeedSetting)[keyof typeof TextSpeedSetting];

export const textSpeedSettingSchema = z.enum(TextSpeedSetting) satisfies z.ZodType<TextSpeedSetting>;
