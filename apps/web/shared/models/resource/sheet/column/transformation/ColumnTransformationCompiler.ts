import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnCellReader } from "#shared/models/resource/sheet/column/ColumnCellReader";
import type { ColumnTransformation } from "#shared/models/resource/sheet/column/transformation/ColumnTransformation";
import type { ColumnTransformationBindContext } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationBindContext";
import type { ToData } from "@esposter/shared";

export type ColumnTransformationCompiler<T extends ColumnTransformation> = (
  transformation: T,
  findSource: (sourceColumnId: string) => ToData<Column> | undefined,
) => (context: ColumnTransformationBindContext) => ColumnCellReader;
