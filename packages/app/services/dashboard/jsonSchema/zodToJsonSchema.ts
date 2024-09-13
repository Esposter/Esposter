import type { JSONSchema } from "@/models/jsonSchema/JSONSchema";
import type { TupleSlice } from "@esposter/shared";
import type { z } from "zod";

import { recursiveAssignTitle } from "@/services/dashboard/jsonSchema/recusiveAssignTitle";
import { zodToJsonSchema as baseZodToJsonSchema } from "zod-to-json-schema";

export const zodToJsonSchema = <T extends object>(
  schema: z.ZodType<T>,
  ...rest: TupleSlice<Parameters<typeof baseZodToJsonSchema>, 1>
) => {
  // For integrating with vjsf, we only need the type and properties
  const { properties, type } = baseZodToJsonSchema(schema, ...rest) as JSONSchema<T>;
  recursiveAssignTitle(properties);
  return { properties, type };
};
