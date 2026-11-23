import type { SchemaFormLayout } from "#shared/models/schemaForm/SchemaFormLayout";
import type { JsonSchema } from "@jsonforms/core";

// The layout meta a node of a form schema carries, which Zod writes beside the keywords JSON Forms types and JSON Forms
// Knows nothing of
export const getSchemaFormLayout = (schema?: JsonSchema) =>
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- JSON Forms' JsonSchema types no key for the layout meta Zod writes beside its keywords, so the compiler cannot read it
  (schema as { layout?: SchemaFormLayout } | undefined)?.layout;
