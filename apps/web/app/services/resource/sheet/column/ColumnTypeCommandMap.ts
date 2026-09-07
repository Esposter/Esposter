import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";
import type { Except } from "type-fest";

import { BooleanColumn } from "#shared/models/resource/sheet/column/BooleanColumn";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { ComputedColumn } from "#shared/models/resource/sheet/column/ComputedColumn";
import { DateColumn } from "#shared/models/resource/sheet/column/DateColumn";
import { NumberColumn } from "#shared/models/resource/sheet/column/NumberColumn";
import { StringColumn } from "#shared/models/resource/sheet/column/StringColumn";
import { CreateColumnCommand } from "@/models/resource/sheet/commands/CreateColumnCommand";
import { CreateComputedColumnCommand } from "@/models/resource/sheet/commands/CreateComputedColumnCommand";

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
