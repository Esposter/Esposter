import { z } from "zod";

export enum AnimationsSetting {
  Off = "Off",
  On = "On",
}

export const animationsSettingSchema = z.nativeEnum(AnimationsSetting) as const satisfies z.ZodType<AnimationsSetting>;
