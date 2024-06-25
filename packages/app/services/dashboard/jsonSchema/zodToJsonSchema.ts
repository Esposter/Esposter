import type { JSONSchema } from "@/models/jsonSchema/JSONSchema";
import { recursiveAssignTitle } from "@/services/dashboard/jsonSchema/recusiveAssignTitle";
import type { TupleSlice } from "@/util/types/TupleSlice";
import type { z } from "zod";
import { zodToJsonSchema as baseZodToJsonSchema } from "zod-to-json-schema";

export const zodToJsonSchema = <T extends object, TSchema extends z.ZodType<T>>(
  schema: TSchema,
  ...rest: TupleSlice<Parameters<typeof baseZodToJsonSchema>, 1>
) => {
  // For integrating with vjsf, we only need the type and properties
  const { type, properties } = baseZodToJsonSchema(schema, ...rest) as JSONSchema<T>;
  recursiveAssignTitle(properties);
  return { type, properties };
};
