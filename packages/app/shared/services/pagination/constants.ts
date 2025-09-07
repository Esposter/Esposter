import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";

export const DEFAULT_READ_LIMIT = 15;
export const MAX_READ_LIMIT = 1000;
// A note that the order is always Asc since Azure Table Storage does not support sorting
// We workaround supporting sorting via insert-sorts with the row key using reverse-ticked timestamps
export const MESSAGE_ROWKEY_SORT_ITEM = { key: "rowKey", order: SortOrder.Asc } as const satisfies SortItem<
  keyof MessageEntity
>;
