import type { AEntity } from "#shared/models/entity/AEntity";
import type { ToData } from "#shared/models/entity/ToData";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Clause, CompositeKey } from "@esposter/shared";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { deserialize } from "#shared/services/pagination/cursor/deserialize";
import { BinaryOperator, escapeValue, exhaustiveGuard, NotFoundError, serializeKey } from "@esposter/shared";

export const getCursorWhereAzureTable = <TItem extends CompositeKey | ToData<AEntity>>(
  serializedCursors: string,
  sortBy: SortItem<keyof TItem & string>[],
): Clause[] => {
  const cursors = deserialize(serializedCursors);
  const serializedSortBy = sortBy.map(({ key, ...rest }) => ({ key: serializeKey(key), ...rest }));
  return Object.entries(cursors).map(([key, value]) => {
    const serializedKey = serializeKey(key);
    const sortItem = serializedSortBy.find((s) => s.key === serializedKey);
    if (!sortItem) throw new NotFoundError(getCursorWhereAzureTable.name, key);

    let operator: BinaryOperator;
    switch (sortItem.order) {
      case SortOrder.Asc:
        operator = sortItem.isIncludeValue ? BinaryOperator.ge : BinaryOperator.gt;
        break;
      case SortOrder.Desc:
        operator = sortItem.isIncludeValue ? BinaryOperator.le : BinaryOperator.lt;
        break;
      default:
        exhaustiveGuard(sortItem.order);
    }
    return { key, operator, value: escapeValue(value) };
  });
};
