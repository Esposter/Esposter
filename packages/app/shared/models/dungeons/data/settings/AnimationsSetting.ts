import type { Type } from "arktype";

import { type } from "arktype";

export enum AnimationsSetting {
  Off = "Off",
  On = "On",
}

export const animationsSettingSchema = type.valueOf(AnimationsSetting) satisfies Type<AnimationsSetting>;
