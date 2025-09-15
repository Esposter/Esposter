import type { CompositeKey } from "#shared/models/azure/CompositeKey";
import type { AEntity } from "#shared/models/entity/AEntity";
import type { ToData } from "#shared/models/entity/ToData";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { serializeKey } from "#shared/services/azure/table/serializeKey";
import { deserialize } from "#shared/services/pagination/cursor/deserialize";
import { BinaryOperator, exhaustiveGuard, NotFoundError, UnaryOperator } from "@esposter/shared";

export const getCursorWhereAzureTable = <TItem extends CompositeKey | ToData<AEntity>>(
  serializedCursors: string,
  sortBy: SortItem<keyof TItem & string>[],
) => {
  const cursors = deserialize(serializedCursors);
  const serializedSortBy = sortBy.map(({ key, ...rest }) => ({ key: serializeKey(key), ...rest }));
  return Object.entries(cursors)
    .map(([key, value]) => {
      const serializedKey = serializeKey(key);
      const sortItem = serializedSortBy.find((s) => s.key === serializedKey);
      if (!sortItem) throw new NotFoundError(getCursorWhereAzureTable.name, key);

      let comparer: BinaryOperator;
      switch (sortItem.order) {
        case SortOrder.Asc:
          comparer = sortItem.isIncludeValue ? BinaryOperator.ge : BinaryOperator.gt;
          break;
        case SortOrder.Desc:
          comparer = sortItem.isIncludeValue ? BinaryOperator.le : BinaryOperator.lt;
          break;
        default:
          exhaustiveGuard(sortItem.order);
      }
      return `${serializedKey} ${comparer} '${value}'`;
    })
    .join(` ${UnaryOperator.and} `);
};
