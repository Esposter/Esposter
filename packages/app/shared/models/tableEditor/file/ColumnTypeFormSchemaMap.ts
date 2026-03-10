import type { z } from "zod";

import { columnFormSchema } from "#shared/models/tableEditor/file/Column";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { dateColumnFormSchema } from "#shared/models/tableEditor/file/DateColumn";

export const ColumnTypeFormSchemaWithoutNameMap = {
  [ColumnType.Boolean]: columnFormSchema.omit({ name: true }),
  [ColumnType.Date]: dateColumnFormSchema.omit({ name: true }),
  [ColumnType.Number]: columnFormSchema.omit({ name: true }),
  [ColumnType.String]: columnFormSchema.omit({ name: true }),
} as const satisfies Record<ColumnType, z.ZodType>;
