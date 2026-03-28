import { prettify } from "@/util/text/prettify";
import { toTitleCase } from "@/util/text/toTitleCase";
import { z } from "zod";
// Apply prettify so enum values like "ConvertTo" become "Convert To"
export const processTitle = (schema: z.core.JSONSchema.JSONSchema) => {
  if (!schema.title) return;
  schema.title = toTitleCase(prettify(schema.title));
};
