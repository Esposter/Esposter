import { z } from "zod";

export const AnimationsSetting = { Off: "Off", On: "On" } as const;
export type AnimationsSetting = (typeof AnimationsSetting)[keyof typeof AnimationsSetting];

export const animationsSettingSchema = z.enum(AnimationsSetting) satisfies z.ZodType<AnimationsSetting>;
