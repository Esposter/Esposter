import { z } from "zod";

// The design styles a reader can pick between, beside light and dark: each draws the same layout its own way
export const UiStyle = { Genshin: "genshin", Standard: "standard", Voxel: "voxel" } as const;
export type UiStyle = (typeof UiStyle)[keyof typeof UiStyle];

export const UiStyles = Object.values(UiStyle);

export const uiStyleSchema = z.enum(UiStyle) satisfies z.ZodType<UiStyle>;
