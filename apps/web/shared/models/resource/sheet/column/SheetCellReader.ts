import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { ToData } from "@esposter/shared";

export type SheetCellReader = (row: ToData<Row>, column: ToData<Column>, rowIndex?: number) => ColumnValue;
