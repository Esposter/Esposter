import { z } from "zod";

export enum AnimationsSetting {
  Off = "Off",
  On = "On",
}

export const animationsSettingSchema = z.nativeEnum(AnimationsSetting) satisfies z.ZodType<AnimationsSetting>;
