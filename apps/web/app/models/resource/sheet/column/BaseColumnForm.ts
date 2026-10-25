import type { AColumn } from "#shared/models/resource/sheet/column/AColumn";
import type { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";

export interface BaseColumnForm<TColumnType extends ColumnType = ColumnType> extends Pick<
  AColumn<TColumnType>,
  "description" | "name" | "sourceName" | "type"
> {}
