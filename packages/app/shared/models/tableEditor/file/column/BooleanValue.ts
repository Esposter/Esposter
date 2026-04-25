import { z } from "zod";

export enum BooleanValue {
  False = "false",
  True = "true",
}

export const booleanValueSchema = z.enum(BooleanValue) satisfies z.ZodType<BooleanValue>;

export const BooleanValues: ReadonlySet<BooleanValue> = new Set(Object.values(BooleanValue));
