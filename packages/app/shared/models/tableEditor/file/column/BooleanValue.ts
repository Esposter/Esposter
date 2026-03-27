import { z } from "zod";

export enum BooleanValue {
  False = "false",
  True = "true",
}

export const booleanValueSchema = z.enum(BooleanValue) satisfies z.ZodType<BooleanValue>;

export const BooleanValues = new Set(Object.values(BooleanValue));
