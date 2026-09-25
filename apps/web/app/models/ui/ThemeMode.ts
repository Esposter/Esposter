import { z } from "zod";
// The reader's choice of light or dark, or whichever the system asks for
export enum ThemeMode {
  Dark = "dark",
  Light = "light",
  System = "system",
}

export const ThemeModes = Object.values(ThemeMode);

export const themeModeSchema = z.enum(ThemeMode) satisfies z.ZodType<ThemeMode>;
