import { z } from "zod";

export enum ClickerType {
  Default = "Default",
  Magical = "Magical",
  Physical = "Physical",
}

export const clickerTypeSchema = z.nativeEnum(ClickerType) as const satisfies z.ZodType<ClickerType>;
