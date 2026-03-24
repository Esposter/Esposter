import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { Column } from "#shared/models/tableEditor/file/column/Column";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { DateColumn } from "#shared/models/tableEditor/file/column/DateColumn";

export const ColumnTypeCreateMap = {
  [ColumnType.Boolean]: { create: (name = "") => new Column({ name, type: ColumnType.Boolean }) },
  [ColumnType.Date]: { create: (name = "") => new DateColumn({ name }) },
  [ColumnType.Number]: { create: (name = "") => new Column({ name, type: ColumnType.Number }) },
  [ColumnType.String]: { create: (name = "") => new Column({ name, type: ColumnType.String }) },
} as const satisfies Record<
  Exclude<ColumnType, ColumnType.Computed>,
  { create: (name?: string) => DataSource["columns"][number] }
>;
