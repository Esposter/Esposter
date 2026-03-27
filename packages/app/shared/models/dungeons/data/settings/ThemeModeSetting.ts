import { z } from "zod";

export enum ThemeModeSetting {
  Blue = "Blue",
  Green = "Green",
  Purple = "Purple",
}

export const themeModeSettingSchema = z.enum(ThemeModeSetting) satisfies z.ZodType<ThemeModeSetting>;

export const ThemeModeSettings = new Set(Object.values(ThemeModeSetting));
