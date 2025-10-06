import type { SerializableValue } from "@esposter/shared";

import { SERIALIZABLE_VALUE_MAX_LENGTH } from "#shared/services/azure/constants";
import { z } from "zod";

export const serializableValueSchema = z.union([
  z.boolean(),
  z.date(),
  z.null(),
  z.number(),
  z.string().min(1).max(SERIALIZABLE_VALUE_MAX_LENGTH),
]) satisfies z.ZodType<SerializableValue>;
