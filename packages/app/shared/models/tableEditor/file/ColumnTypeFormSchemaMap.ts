import type { z } from "zod";

import { columnFormSchema } from "#shared/models/tableEditor/file/Column";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { dateColumnFormSchema } from "#shared/models/tableEditor/file/DateColumn";

export const ColumnTypeFormSchemaMap = {
  [ColumnType.Boolean]: columnFormSchema,
  [ColumnType.Date]: dateColumnFormSchema,
  [ColumnType.Number]: columnFormSchema,
  [ColumnType.String]: columnFormSchema,
} as const satisfies Record<ColumnType, z.ZodType>;

export const ColumnTypeFormSchemaWithoutNameMap = {
  [ColumnType.Boolean]: columnFormSchema.omit({ name: true }),
  [ColumnType.Date]: dateColumnFormSchema.omit({ name: true }),
  [ColumnType.Number]: columnFormSchema.omit({ name: true }),
  [ColumnType.String]: columnFormSchema.omit({ name: true }),
} as const satisfies Record<ColumnType, z.ZodType>;
