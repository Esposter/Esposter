import { z } from "zod";

export enum ThemeModeSetting {
  Blue = "Blue",
  Green = "Green",
  Purple = "Purple",
}

export const themeModeSettingSchema = z.nativeEnum(ThemeModeSetting) as const satisfies z.ZodType<ThemeModeSetting>;
