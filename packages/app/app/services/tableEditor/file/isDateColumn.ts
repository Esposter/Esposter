import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DateColumn } from "#shared/models/tableEditor/file/DateColumn";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";

export const isDateColumn = (column: DataSource["columns"][number]): column is DateColumn =>
  column.type === ColumnType.Date;
