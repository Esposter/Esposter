import type { UniqueArraySchemaKey } from "#src/models/zod/UniqueArraySchemaKey";
import type { z } from "zod";

import { createUniqueByKeyArraySchema } from "#src/services/zod/createUniqueByKeyArraySchema";
import { getItemKey } from "#src/services/zod/getItemKey";

// Items are told apart by a key, because a Set compares an object by reference: a schema of objects with no key would
// Pass two equal objects as unique. An array of primitives takes `createUniquePrimitiveArraySchema` instead
export const createUniqueArraySchema = <TSchema extends z.ZodType<object>>(
  schema: TSchema,
  key: readonly UniqueArraySchemaKey<TSchema>[] | UniqueArraySchemaKey<TSchema>,
): z.ZodArray<TSchema> => createUniqueByKeyArraySchema(schema, (item) => getItemKey(item, key));
