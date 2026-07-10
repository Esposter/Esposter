import type { Column } from "#shared/models/resource/file/column/Column";
import type { ADataSourceCommand } from "@/models/resource/file/commands/ADataSourceCommand";
import type { Except } from "type-fest";

import { BooleanColumn } from "#shared/models/resource/file/column/BooleanColumn";
import { ColumnType } from "#shared/models/resource/file/column/ColumnType";
import { ComputedColumn } from "#shared/models/resource/file/column/ComputedColumn";
import { DateColumn } from "#shared/models/resource/file/column/DateColumn";
import { NumberColumn } from "#shared/models/resource/file/column/NumberColumn";
import { StringColumn } from "#shared/models/resource/file/column/StringColumn";
import { CreateColumnCommand } from "@/models/resource/file/commands/CreateColumnCommand";
import { CreateComputedColumnCommand } from "@/models/resource/file/commands/CreateComputedColumnCommand";

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
