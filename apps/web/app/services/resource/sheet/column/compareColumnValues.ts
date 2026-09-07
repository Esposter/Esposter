import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

import { EN_US_COMPARATOR } from "#shared/services/intl/constants";

export const compareColumnValues = (firstValue: ColumnValue, secondValue: ColumnValue): number => {
  if (firstValue === secondValue) return 0;
  // An empty cell sorts ahead of every filled one, matching how the data table orders a missing value
  else if (firstValue === null) return -1;
  else if (secondValue === null) return 1;
  else if (typeof firstValue === "number" && typeof secondValue === "number") return firstValue - secondValue;
  else if (typeof firstValue === "boolean" && typeof secondValue === "boolean")
    return Number(firstValue) - Number(secondValue);
  else return EN_US_COMPARATOR.compare(String(firstValue).toLocaleLowerCase(), String(secondValue).toLocaleLowerCase());
};
