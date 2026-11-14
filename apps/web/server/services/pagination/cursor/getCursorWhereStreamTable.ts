import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { AzureEntity, Clause } from "@esposter/db-schema";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { deserialize } from "#shared/services/pagination/cursor/deserialize";
import { BinaryOperator } from "@esposter/db-schema";
import { exhaustiveGuard, NotFoundError } from "@esposter/shared";

export const getCursorWhereStreamTable = <TItem extends AzureEntity>(
  serializedCursors: string,
  sortBy: SortItem<keyof TItem & string>[],
): Clause<TItem>[] => {
  const cursors = deserialize(serializedCursors);
  return Object.entries(cursors).map(([key, value]) => {
    const sortItem = sortBy.find(({ key: sortKey }) => sortKey === key);
    if (!sortItem) throw new NotFoundError(getCursorWhereStreamTable.name, key);

    let operator: BinaryOperator;
    switch (sortItem.order) {
      case SortOrder.Asc:
        operator = sortItem.isIncludeValue ? BinaryOperator.Ge : BinaryOperator.Gt;
        break;
      case SortOrder.Desc:
        operator = sortItem.isIncludeValue ? BinaryOperator.Le : BinaryOperator.Lt;
        break;
      default:
        exhaustiveGuard(sortItem.order);
    }
    // The cursor payload is a plain record, so its key comes back as a bare string the compiler cannot tie
    // Back to TItem — the sortItem lookup above is what proves it names one of TItem's sorted columns
    return { key, operator, value } as Clause<TItem>;
  });
};
