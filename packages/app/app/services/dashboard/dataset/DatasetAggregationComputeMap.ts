import type { ColumnValue } from "#shared/models/resource/file/column/ColumnValue";

import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";

const getNumbers = (values: ColumnValue[]): number[] => values.filter((value) => typeof value === "number");

export const DatasetAggregationComputeMap: Record<DatasetAggregationType, (values: ColumnValue[]) => number> = {
  [DatasetAggregationType.Average]: (values) => {
    const numbers = getNumbers(values);
    return numbers.length === 0 ? 0 : numbers.reduce((total, number) => total + number, 0) / numbers.length;
  },
  [DatasetAggregationType.Count]: (values) => values.filter((value) => value !== null).length,
  [DatasetAggregationType.Maximum]: (values) => {
    const numbers = getNumbers(values);
    return numbers.length === 0 ? 0 : Math.max(...numbers);
  },
  [DatasetAggregationType.Minimum]: (values) => {
    const numbers = getNumbers(values);
    return numbers.length === 0 ? 0 : Math.min(...numbers);
  },
  [DatasetAggregationType.Sum]: (values) => getNumbers(values).reduce((total, number) => total + number, 0),
};
