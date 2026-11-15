import { z } from "zod";

export const ThemeModeSetting = { Blue: "Blue", Green: "Green", Purple: "Purple" } as const;
export type ThemeModeSetting = (typeof ThemeModeSetting)[keyof typeof ThemeModeSetting];

export const themeModeSettingSchema = z.enum(ThemeModeSetting) satisfies z.ZodType<ThemeModeSetting>;

export const ThemeModeSettings = Object.values(ThemeModeSetting);
