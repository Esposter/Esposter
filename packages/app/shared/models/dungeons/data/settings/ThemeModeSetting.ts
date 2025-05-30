import { z } from "zod/v4";

export enum ThemeModeSetting {
  Blue = "Blue",
  Green = "Green",
  Purple = "Purple",
}

export const themeModeSettingSchema = z.enum(ThemeModeSetting) satisfies z.ZodType<ThemeModeSetting>;
