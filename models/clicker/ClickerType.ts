import { z } from "zod";

export enum ClickerType {
  Default = "Default",
  Physical = "Physical",
  Magical = "Magical",
}

export const clickerTypeSchema = z.nativeEnum(ClickerType) satisfies z.ZodType<ClickerType>;
