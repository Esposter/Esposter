import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { Column } from "#shared/models/tableEditor/file/column/Column";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ComputedColumn } from "#shared/models/tableEditor/file/column/ComputedColumn";
import { DateColumn } from "#shared/models/tableEditor/file/column/DateColumn";
import type { ToData } from "@esposter/shared";
import type { Except } from "type-fest";

export const ColumnTypeCreateMap = {
  [ColumnType.Boolean]: {
    create: (init?: ToData<Except<Partial<Column<ColumnType.Boolean>>, "type">>) =>
      new Column({ ...init, type: ColumnType.Boolean }),
  },
  [ColumnType.Computed]: {
    create: (init?: ToData<Except<Partial<ComputedColumn>, "type">>) => new ComputedColumn({ ...init }),
  },
  [ColumnType.Date]: {
    create: (init?: ToData<Except<Partial<DateColumn>, "type">>) => new DateColumn({ ...init }),
  },
  [ColumnType.Number]: {
    create: (init?: ToData<Except<Partial<Column<ColumnType.Number>>, "type">>) =>
      new Column({ ...init, type: ColumnType.Number }),
  },
  [ColumnType.String]: {
    create: (init?: ToData<Except<Partial<Column<ColumnType.String>>, "type">>) =>
      new Column({ ...init, type: ColumnType.String }),
  },
} as const satisfies Record<
  ColumnType,
  { create: (init?: ToData<Except<Partial<Column>, "type">>) => DataSource["columns"][number] }
>;
