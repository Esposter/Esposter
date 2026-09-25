import type { SchemaFormLayout } from "#shared/models/schemaForm/SchemaFormLayout";
import type { JsonSchema } from "@jsonforms/core";

// The layout meta a node of a form schema carries, which Zod writes beside the keywords JSON Forms types and JSON Forms
// Knows nothing of
export const getSchemaFormLayout = (schema?: JsonSchema) =>
  (schema as undefined | { layout?: SchemaFormLayout })?.layout;
