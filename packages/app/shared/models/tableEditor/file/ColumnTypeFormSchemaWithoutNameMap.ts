import type { columnFormSchema } from "#shared/models/tableEditor/file/ColumnForm";

import { ColumnTypeFormSchemaMap } from "#shared/models/tableEditor/file/ColumnTypeFormSchemaMap";

export const ColumnTypeFormSchemaWithoutNameMap = Object.fromEntries(
  Object.entries(ColumnTypeFormSchemaMap).map(([type, schema]) => [
    type,
    (schema as typeof columnFormSchema).omit({ name: true }),
  ]),
);
