import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { MessageEntity } from "@esposter/db-schema";

import { ItemMetadataPropertyNames } from "#shared/models/entity/ItemMetadataPropertyNames";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { CompositeKeyPropertyNames } from "@esposter/azure";

export const DEFAULT_READ_LIMIT = 15;
// Paces waypoint-driven refetches so a permanently failing query can't spin into a hot retry loop
export const BACKOFF_BASE_DELAY_MS = Temporal.Duration.from({ seconds: 1 }).total("milliseconds");
export const BACKOFF_MAX_DELAY_MS = Temporal.Duration.from({ seconds: 30 }).total("milliseconds");
// Order is always Asc: Azure Table Storage has no sorting, so we insert-sort via reverse-ticked rowKeys.
export const MESSAGE_ROW_KEY_SORT_ITEM = {
  key: CompositeKeyPropertyNames.rowKey,
  order: SortOrder.Asc,
} as const satisfies SortItem<keyof MessageEntity>;
// Newest-first, the default every paginated read of a timestamped entity opens on.
export const CREATED_AT_DESCENDING_SORT_ITEM = {
  key: ItemMetadataPropertyNames.createdAt,
  order: SortOrder.Desc,
} as const satisfies SortItem<typeof ItemMetadataPropertyNames.createdAt>;
// Most-recently-touched first, the default every paginated read of a mutable entity opens on.
export const UPDATED_AT_DESCENDING_SORT_ITEM = {
  key: ItemMetadataPropertyNames.updatedAt,
  order: SortOrder.Desc,
} as const satisfies SortItem<typeof ItemMetadataPropertyNames.updatedAt>;
