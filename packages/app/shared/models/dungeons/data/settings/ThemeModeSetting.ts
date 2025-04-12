import type { Type } from "arktype";

import { type } from "arktype";

export enum ThemeModeSetting {
  Blue = "Blue",
  Green = "Green",
  Purple = "Purple",
}

export const themeModeSettingSchema = type.valueOf(ThemeModeSetting) satisfies Type<ThemeModeSetting>;
