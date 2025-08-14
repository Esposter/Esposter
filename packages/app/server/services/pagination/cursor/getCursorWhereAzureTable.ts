import type { CompositeKey } from "#shared/models/azure/CompositeKey";
import type { AEntity } from "#shared/models/entity/AEntity";
import type { ToData } from "#shared/models/entity/ToData";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { CompositeKeyPropertyNames } from "#shared/models/azure/CompositeKey";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { deserialize } from "#shared/services/pagination/cursor/deserialize";
import { capitalize, exhaustiveGuard, NotFoundError } from "@esposter/shared";

export const getCursorWhereAzureTable = <TItem extends CompositeKey | ToData<AEntity>>(
  serializedCursors: string,
  sortBy: SortItem<keyof TItem & string>[],
) => {
  const cursors = deserialize(serializedCursors);
  const sanitizedSortBy = sortBy.map(({ key, ...rest }) => ({ key: sanitizeKey(key), ...rest }));
  return Object.entries(cursors)
    .map(([key, value]) => {
      const sanitizedKey = sanitizeKey(key);
      const sortItem = sanitizedSortBy.find((s) => s.key === sanitizedKey);
      if (!sortItem) throw new NotFoundError(getCursorWhereAzureTable.name, key);

      let comparer: string;
      switch (sortItem.order) {
        case SortOrder.Asc:
          comparer = sortItem.isIncludeValue ? "ge" : "gt";
          break;
        case SortOrder.Desc:
          comparer = sortItem.isIncludeValue ? "le" : "lt";
          break;
        default:
          exhaustiveGuard(sortItem.order);
      }
      return `${sanitizedKey} ${comparer} '${value}'`;
    })
    .join(" and ");
};
// Stupid Azure and Javascript property name casing conventions
const KeysToCapitalize = new Set<string>([CompositeKeyPropertyNames.partitionKey, CompositeKeyPropertyNames.rowKey]);
const sanitizeKey = (key: string) => (KeysToCapitalize.has(key) ? capitalize(key) : key);
