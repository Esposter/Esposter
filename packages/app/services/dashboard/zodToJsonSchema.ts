import type { JSONSchema7 } from "json-schema";
import { zodToJsonSchema as baseZodToJsonSchema } from "zod-to-json-schema";

export const zodToJsonSchema: typeof baseZodToJsonSchema = (...args) => {
  // For integrating with vjsf, we only need the type and properties
  const { type, properties } = baseZodToJsonSchema(...args) as JSONSchema7;
  return { type, properties };
};
