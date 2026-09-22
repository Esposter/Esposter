import { SERIALIZABLE_VALUE_MAX_LENGTH } from "#src/services/shared/constants";
import { z } from "zod";

export type SerializableValue = boolean | Date | null | number | string;

export const serializableValueSchema: z.ZodType<SerializableValue, SerializableValue> = z.union([
  z.boolean(),
  z.date(),
  z.null(),
  z.number(),
  z.string().min(1).max(SERIALIZABLE_VALUE_MAX_LENGTH),
]);
