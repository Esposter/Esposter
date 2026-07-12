import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Resource } from "@esposter/db-schema";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { dayjs } from "#shared/services/dayjs";
import { ItemMetadataPropertyNames } from "@esposter/shared";

// How long a pending "G" chord prefix stays armed before the second key must be pressed
export const KEY_CHORD_TIMEOUT_MS = dayjs.duration(1, "second").asMilliseconds();
export const RECENT_RESOURCES_LIMIT = 5;
export const RESOURCE_DATE_FORMAT = "ddd, MMM D, YYYY h:mm A";
// Caps the chunked CSV export re-query so export cost stays bounded on huge lists
export const MAX_CSV_EXPORT_ROWS = 10_000;
export const DEFAULT_RESOURCE_SORT_BY = [
  { key: ItemMetadataPropertyNames.updatedAt, order: SortOrder.Desc },
] as const satisfies readonly SortItem<keyof Resource>[];
