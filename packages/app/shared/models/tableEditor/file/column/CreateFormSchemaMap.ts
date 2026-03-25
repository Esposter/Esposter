import type { columnFormSchema } from "#shared/models/tableEditor/file/column/ColumnForm";

import { ColumnTypeFormSchemaMap } from "#shared/models/tableEditor/file/column/ColumnTypeFormSchemaMap";

export const CreateFormSchemaMap = Object.fromEntries(
  Object.entries(ColumnTypeFormSchemaMap).map(([type, schema]) => [
    type,
    (schema as typeof columnFormSchema).omit({ type: true }),
  ]),
);
