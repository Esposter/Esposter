import type { ColumnCellReader } from "#shared/models/resource/sheet/column/ColumnCellReader";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { ColumnTransformationBindContext } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationBindContext";

// The reader of a transformation that computes from its source column's value as a string, a null value staying null
export const createStringValueReader =
  (sourceColumnId: string, computeValue: (value: string) => ColumnValue) =>
  ({ readSource }: ColumnTransformationBindContext): ColumnCellReader => {
    const readValue = readSource(sourceColumnId);
    return (row, rowIndex) => {
      const value = readValue(row, rowIndex);
      if (value === null) return null;
      return computeValue(String(value));
    };
  };
