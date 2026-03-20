import type { columnFormSchema } from "#shared/models/tableEditor/file/ColumnForm";

import { ColumnTypeFormSchemaMap } from "#shared/models/tableEditor/file/ColumnTypeFormSchemaMap";

export const EditFormSchemaMap = Object.fromEntries(
  Object.entries(ColumnTypeFormSchemaMap).map(([type, schema]) => [
    type,
    (schema as typeof columnFormSchema).omit({ name: true }),
  ]),
);
