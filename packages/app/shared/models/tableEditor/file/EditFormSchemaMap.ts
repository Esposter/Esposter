import type { columnFormSchema } from "#shared/models/tableEditor/file/ColumnForm";

import { CreateFormSchemaMap } from "#shared/models/tableEditor/file/CreateFormSchemaMap";

export const EditFormSchemaMap = Object.fromEntries(
  Object.entries(CreateFormSchemaMap).map(([type, schema]) => [
    type,
    (schema as typeof columnFormSchema).omit({ name: true }),
  ]),
);
