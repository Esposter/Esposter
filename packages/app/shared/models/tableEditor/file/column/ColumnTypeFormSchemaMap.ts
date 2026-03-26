import { columnFormSchema } from "#shared/models/tableEditor/file/column/ColumnForm";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { computedColumnFormSchema } from "#shared/models/tableEditor/file/column/ComputedColumn";
import { dateColumnFormSchema } from "#shared/models/tableEditor/file/column/DateColumn";

export const ColumnTypeFormSchemaMap = {
  [ColumnType.Boolean]: columnFormSchema,
  [ColumnType.Computed]: computedColumnFormSchema,
  [ColumnType.Date]: dateColumnFormSchema,
  [ColumnType.Number]: columnFormSchema,
  [ColumnType.String]: columnFormSchema,
};
