import { z } from "zod";

export enum ThemeModeSetting {
  Blue = "Blue",
  Green = "Green",
  Purple = "Purple",
}

export const themeModeSettingSchema = z.enum(ThemeModeSetting) satisfies z.ZodType<ThemeModeSetting>;

export const ThemeModeSettings: ReadonlySet<ThemeModeSetting> = new Set(Object.values(ThemeModeSetting));
