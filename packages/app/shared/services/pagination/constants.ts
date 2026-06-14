import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { MessageEntity } from "@esposter/db-schema";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";

export const DEFAULT_READ_LIMIT = 15;
// Order is always Asc: Azure Table Storage has no sorting, so we insert-sort via reverse-ticked rowKeys.
export const MESSAGE_ROWKEY_SORT_ITEM = { key: "rowKey", order: SortOrder.Asc } as const satisfies SortItem<
  keyof MessageEntity
>;
