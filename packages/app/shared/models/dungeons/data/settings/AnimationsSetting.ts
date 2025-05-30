import { z } from "zod/v4";

export enum AnimationsSetting {
  Off = "Off",
  On = "On",
}

export const animationsSettingSchema = z.enum(AnimationsSetting) satisfies z.ZodType<AnimationsSetting>;
