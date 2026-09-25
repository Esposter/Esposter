import { z } from "zod";
// The design styles a reader can pick between, beside light and dark: each draws the same layout its own way
export enum UiStyle {
  Standard = "standard",
  Voxel = "voxel",
}

export const UiStyles = Object.values(UiStyle);

export const uiStyleSchema = z.enum(UiStyle) satisfies z.ZodType<UiStyle>;
