import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";

import { BooleanColumn } from "#shared/models/tableEditor/file/column/BooleanColumn";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ComputedColumn } from "#shared/models/tableEditor/file/column/ComputedColumn";
import { DateColumn } from "#shared/models/tableEditor/file/column/DateColumn";
import { NumberColumn } from "#shared/models/tableEditor/file/column/NumberColumn";
import { StringColumn } from "#shared/models/tableEditor/file/column/StringColumn";
import { CreateColumnCommand } from "@/models/tableEditor/file/commands/CreateColumnCommand";
import { CreateComputedColumnCommand } from "@/models/tableEditor/file/commands/CreateComputedColumnCommand";
import type { ToData } from "@esposter/shared";
import type { Except } from "type-fest";

type ColumnWithoutId = Except<ToData<Column>, "id">;

export const ColumnTypeCommandMap = {
  [ColumnType.Boolean]: (columnIndex: number, data: ColumnWithoutId) =>
    new CreateColumnCommand(columnIndex, new BooleanColumn(data as Partial<BooleanColumn>)),
  [ColumnType.Computed]: (columnIndex: number, data: ColumnWithoutId) =>
    new CreateComputedColumnCommand(columnIndex, new ComputedColumn(data as Partial<ComputedColumn>)),
  [ColumnType.Date]: (columnIndex: number, data: ColumnWithoutId) =>
    new CreateColumnCommand(columnIndex, new DateColumn(data as Partial<DateColumn>)),
  [ColumnType.Number]: (columnIndex: number, data: ColumnWithoutId) =>
    new CreateColumnCommand(columnIndex, new NumberColumn(data as Partial<NumberColumn>)),
  [ColumnType.String]: (columnIndex: number, data: ColumnWithoutId) =>
    new CreateColumnCommand(columnIndex, new StringColumn(data as Partial<StringColumn>)),
} as const satisfies Record<ColumnType, (columnIndex: number, data: ColumnWithoutId) => ADataSourceCommand>;
