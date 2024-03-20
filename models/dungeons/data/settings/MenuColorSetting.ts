import { z } from "zod";

export enum MenuColorSetting {
  Blue = "Blue",
  Green = "Green",
  Purple = "Purple",
}

export const menuColorSettingSchema = z.nativeEnum(MenuColorSetting) satisfies z.ZodType<MenuColorSetting>;
