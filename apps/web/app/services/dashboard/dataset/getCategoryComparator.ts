import type { DatasetQueryOrder } from "#shared/models/dataset/DatasetQueryOrder";
import type { CategoryEntry } from "#src/models/dashboard/CategoryEntry";

import { DatasetOrderDirection } from "#shared/models/dataset/DatasetOrderDirection";
import { takeOne } from "@esposter/shared";

// A category reads as a number when its text is one. The categories compare as numbers only when all of them do,
// That keeps a mixed set comparing as text, so the order stays one total order
const checkIsNumericCategory = (category: string) => category.trim() !== "" && Number.isFinite(Number(category));

export const getCategoryComparator = (entries: CategoryEntry[], { direction, seriesIndex }: DatasetQueryOrder) => {
  const isNumeric = entries.every(({ category }) => checkIsNumericCategory(category));
  const sign = direction === DatasetOrderDirection.Descending ? -1 : 1;
  return (first: CategoryEntry, second: CategoryEntry) => {
    if (seriesIndex !== undefined)
      return sign * (takeOne(first.values, seriesIndex) - takeOne(second.values, seriesIndex));
    if (isNumeric) return sign * (Number(first.category) - Number(second.category));
    return sign * first.category.localeCompare(second.category);
  };
};
