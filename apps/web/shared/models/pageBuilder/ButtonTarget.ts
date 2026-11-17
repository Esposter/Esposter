import { z } from "zod";

// The browsing context a button's link opens into: the reader's own tab, or a new one
export const ButtonTarget = { NewTab: "_blank", SameTab: "_self" } as const;
export type ButtonTarget = (typeof ButtonTarget)[keyof typeof ButtonTarget];
export const buttonTargetSchema = z.enum(ButtonTarget) satisfies z.ZodType<ButtonTarget>;
