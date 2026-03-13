import type { z } from "zod";

import { ColumnTypeFormSchemaMap } from "#shared/models/tableEditor/file/ColumnTypeFormSchemaMap";

export const ColumnTypeFormSchemaWithoutNameMap = Object.fromEntries(
  Object.entries(ColumnTypeFormSchemaMap).map(([type, schema]) => [type, (schema as z.ZodObject).omit({ name: true })]),
);
