import { z } from "zod";

export const SERIALIZABLE_VALUE_MAX_LENGTH = 100;

export type SerializableValue = boolean | Date | null | number | string;

export const serializableValueSchema = z.union([
  z.boolean(),
  z.date(),
  z.null(),
  z.number(),
  z.string().min(1).max(SERIALIZABLE_VALUE_MAX_LENGTH),
]) satisfies z.ZodType<SerializableValue>;
