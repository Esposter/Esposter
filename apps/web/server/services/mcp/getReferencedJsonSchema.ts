import type { JSONSchema } from "zod/v4/core";

// The definition a `$ref` names in the root schema: Zod names the root itself "#", and every other definition it
// Extracts "#/$defs/<name>"
export const getReferencedJsonSchema = (
  rootSchema: JSONSchema.BaseSchema,
  ref: string,
): JSONSchema._JSONSchema | undefined => (ref === "#" ? rootSchema : rootSchema.$defs?.[ref.replace("#/$defs/", "")]);
