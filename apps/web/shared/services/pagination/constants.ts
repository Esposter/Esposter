import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { MessageEntity } from "@esposter/db-schema";
import { CompositeKeyPropertyNames } from "@esposter/db-schema";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";

import { ItemMetadataPropertyNames } from "@esposter/shared";

// One serialised value per sort item, base64-encoded (see serialize) — sized for the longest sort a read accepts
export const CURSOR_MAX_LENGTH = 4096;
export const DEFAULT_READ_LIMIT = 15;
// Sort items are unique by key, so this only has to cover the widest sortable model's keys
export const SORT_BY_MAX_LENGTH = 16;
// Paces waypoint-driven refetches so a permanently failing query can't spin into a hot retry loop
export const BACKOFF_BASE_DELAY_MS = Temporal.Duration.from({ seconds: 1 }).total("milliseconds");
export const BACKOFF_MAX_DELAY_MS = Temporal.Duration.from({ seconds: 30 }).total("milliseconds");
// rowKeys are reverse-ticked, so ascending is newest-first: the order every paginated read of a message opens on.
export const MESSAGE_ROW_KEY_SORT_ITEM = {
  key: CompositeKeyPropertyNames.rowKey,
  order: SortOrder.Asc,
} as const satisfies SortItem<keyof MessageEntity>;
// The same rowKey read descending is oldest-first, the order a reader paging forward through a room takes.
export const MESSAGE_OLDEST_FIRST_SORT_ITEM = {
  key: CompositeKeyPropertyNames.rowKey,
  order: SortOrder.Desc,
} as const satisfies SortItem<keyof MessageEntity>;
// Newest-first, the default every paginated read of a timestamped entity opens on.
export const CREATED_AT_DESCENDING_SORT_ITEM = {
  key: ItemMetadataPropertyNames.createdAt,
  order: SortOrder.Desc,
} as const satisfies SortItem<typeof ItemMetadataPropertyNames.createdAt>;
// The tie-break under the same timestamp, so two rows created in one millisecond still have one place in a page
export const ID_DESCENDING_SORT_ITEM = { key: "id", order: SortOrder.Desc } as const satisfies SortItem<"id">;
// A room's messages are paged newest-first on when they were created, then on id. A cursor over them is the values of
// This sort, so a page can name a message and read on from it in either direction
export const MESSAGE_SORT_BY = [CREATED_AT_DESCENDING_SORT_ITEM, ID_DESCENDING_SORT_ITEM];
// Most-recently-touched first, the default every paginated read of a mutable entity opens on.
export const UPDATED_AT_DESCENDING_SORT_ITEM = {
  key: ItemMetadataPropertyNames.updatedAt,
  order: SortOrder.Desc,
} as const satisfies SortItem<typeof ItemMetadataPropertyNames.updatedAt>;
// The row id breaks a tie in newest-first order, so rows created in the same millisecond still page without a skip
export const ID_DESCENDING_SORT_ITEM = { key: "id", order: SortOrder.Desc } as const satisfies SortItem<"id">;
