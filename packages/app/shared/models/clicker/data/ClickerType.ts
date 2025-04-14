import { z } from "zod";

export enum ClickerType {
  Default = "Default",
  Magical = "Magical",
  Physical = "Physical",
}

export const clickerTypeSchema = z.enum(ClickerType) satisfies z.ZodType<ClickerType>;
