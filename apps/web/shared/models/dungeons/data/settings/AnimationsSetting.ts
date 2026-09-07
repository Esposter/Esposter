import { z } from "zod";

export enum AnimationsSetting {
  Off = "Off",
  On = "On",
}

export const animationsSettingSchema = z.enum(AnimationsSetting) satisfies z.ZodType<AnimationsSetting>;
