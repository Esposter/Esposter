import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ToData } from "@esposter/shared";

import { ColumnTypeCommandMap } from "#src/services/resource/sheet/column/ColumnTypeCommandMap";

export const useCreateColumn = () =>
  useSheetCommand((dataSource, newColumn: ToData<Column>) => {
    const { id: _id, ...newColumnWithoutId } = newColumn;
    const columnIndex = dataSource.columns.length;
    // Indexing the map by a union of types collapses the constructors' parameters to their intersection, so the
    // Column the discriminant just narrowed no longer satisfies the signature the same discriminant selected
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- a call through the union of the map's entries takes the intersection of their parameters, which no union of columns satisfies
    return ColumnTypeCommandMap[newColumnWithoutId.type](columnIndex, newColumnWithoutId as never);
  });
