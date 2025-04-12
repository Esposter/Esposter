import type { Type } from "arktype";

import { type } from "arktype";

export enum TextSpeedSetting {
  Fast = "Fast",
  Mid = "Mid",
  Slow = "Slow",
}

export const textSpeedSettingSchema = type.valueOf(TextSpeedSetting) satisfies Type<TextSpeedSetting>;
