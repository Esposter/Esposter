import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import type { Except } from "type-fest";

import { BooleanColumn } from "#shared/models/tableEditor/file/column/BooleanColumn";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ComputedColumn } from "#shared/models/tableEditor/file/column/ComputedColumn";
import { DateColumn } from "#shared/models/tableEditor/file/column/DateColumn";
import { NumberColumn } from "#shared/models/tableEditor/file/column/NumberColumn";
import { StringColumn } from "#shared/models/tableEditor/file/column/StringColumn";
import { CreateColumnCommand } from "@/models/tableEditor/file/commands/CreateColumnCommand";
import { CreateComputedColumnCommand } from "@/models/tableEditor/file/commands/CreateComputedColumnCommand";

export const ColumnTypeCommandMap = {
  [ColumnType.Boolean]: (columnIndex: number, data: Except<Extract<Column, { type: ColumnType.Boolean }>, "id">) =>
    new CreateColumnCommand(columnIndex, new BooleanColumn(data)),
  [ColumnType.Computed]: (columnIndex: number, data: Except<Extract<Column, { type: ColumnType.Computed }>, "id">) =>
    new CreateComputedColumnCommand(columnIndex, new ComputedColumn(data)),
  [ColumnType.Date]: (columnIndex: number, data: Except<Extract<Column, { type: ColumnType.Date }>, "id">) =>
    new CreateColumnCommand(columnIndex, new DateColumn(data)),
  [ColumnType.Number]: (columnIndex: number, data: Except<Extract<Column, { type: ColumnType.Number }>, "id">) =>
    new CreateColumnCommand(columnIndex, new NumberColumn(data)),
  [ColumnType.String]: (columnIndex: number, data: Except<Extract<Column, { type: ColumnType.String }>, "id">) =>
    new CreateColumnCommand(columnIndex, new StringColumn(data)),
} as const satisfies {
  [K in ColumnType]: (columnIndex: number, data: Except<Extract<Column, { type: K }>, "id">) => ADataSourceCommand;
};
