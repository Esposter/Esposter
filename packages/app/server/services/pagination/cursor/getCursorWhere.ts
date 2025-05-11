import type { AEntity } from "#shared/models/entity/AEntity";
import type { ToData } from "#shared/models/entity/ToData";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { TableConfig } from "drizzle-orm";
import type { PgTableWithColumns } from "drizzle-orm/pg-core";

import { CompositeKeyEntityPropertyNames } from "#shared/models/azure/CompositeKeyEntity";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { parse } from "@@/server/services/pagination/cursor/parse";
import { capitalize } from "@esposter/shared";
import { and, gt, lt } from "drizzle-orm";

export const getCursorWhere = <TTable extends TableConfig, TItem extends ToData<AEntity>>(
  table: PgTableWithColumns<TTable>,
  serializedCursors: string,
  sortBy: SortItem<keyof TItem & string>[],
) => {
  const cursors = parse(serializedCursors);
  return and(
    ...Object.entries(cursors).map(([key, value]) => {
      const comparer = sortBy.some((s) => s.key === key && s.order === SortOrder.Asc) ? gt : lt;
      return comparer(table[key], value);
    }),
  );
};

export const getCursorWhereAzureTable = <TItem extends ToData<AEntity>>(
  serializedCursors: string,
  sortBy: SortItem<keyof TItem & string>[],
) => {
  const cursors = parse(serializedCursors);
  return Object.entries(cursors)
    .map(([key, value]) => {
      const sanitizedKey = sanitizeKey(key);
      const comparer = sortBy.some(({ key, order }) => sanitizeKey(key) === sanitizedKey && order === SortOrder.Asc)
        ? "gt"
        : "lt";
      return `${sanitizedKey} ${comparer} '${value}'`;
    })
    .join(" and ");
};
// Stupid Azure and Javascript property name casing conventions
const KeysToCapitalize: string[] = [
  CompositeKeyEntityPropertyNames.partitionKey,
  CompositeKeyEntityPropertyNames.rowKey,
];
const sanitizeKey = (key: string) => (KeysToCapitalize.includes(key) ? capitalize(key) : key);
