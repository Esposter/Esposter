import type { Type } from "arktype";

import { type } from "arktype";

export enum SoundSetting {
  Off = "Off",
  On = "On",
}

export const soundSettingSchema = type.valueOf(SoundSetting) satisfies Type<SoundSetting>;
