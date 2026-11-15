import { z } from "zod";

export const ClickerType = { Default: "Default", Magical: "Magical", Physical: "Physical" } as const;
export type ClickerType = (typeof ClickerType)[keyof typeof ClickerType];

export const clickerTypeSchema = z.enum(ClickerType) satisfies z.ZodType<ClickerType>;

export const ClickerTypes = Object.values(ClickerType);
