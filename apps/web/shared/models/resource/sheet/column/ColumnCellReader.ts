import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { ToData } from "@esposter/shared";

export type ColumnCellReader = (row: ToData<Row>, rowIndex?: number) => ColumnValue;
