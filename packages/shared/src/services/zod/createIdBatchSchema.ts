import type { Primitive } from "type-fest";
import type { z } from "zod";

import { MAX_READ_LIMIT } from "#src/services/app/constants";
import { createUniqueArraySchema } from "#src/services/zod/createUniqueArraySchema";

// A batch of ids one request reads or writes: at least one, no id twice, and no more than the read limit allows
export const createIdBatchSchema = <TOutput extends Primitive, TInput, TSchema extends z.ZodType<TOutput, TInput>>(
  idSchema: TSchema,
): z.ZodArray<TSchema> => createUniqueArraySchema(idSchema).min(1).max(MAX_READ_LIMIT);
