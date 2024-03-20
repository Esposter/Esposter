import { z } from "zod";

export enum AnimationsSetting {
  On = "On",
  Off = "Off",
}

export const animationsSettingSchema = z.nativeEnum(AnimationsSetting) satisfies z.ZodType<AnimationsSetting>;
