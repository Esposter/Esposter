import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Resource } from "@esposter/db-schema";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { dayjs } from "#shared/services/dayjs";
import { ItemMetadataPropertyNames } from "@esposter/shared";

// How long a pending "G" chord prefix stays armed before the second key must be pressed
export const KEY_CHORD_TIMEOUT_MS = dayjs.duration(1, "second").asMilliseconds();
// One shared cadence for every edit-triggered autosave — injected by the autosave wrappers so call sites never restate it
export const RESOURCE_AUTOSAVE_DEBOUNCE_MS = dayjs.duration(0.5, "seconds").asMilliseconds();
export const RECENT_RESOURCES_LIMIT = 5;
// Enough parsed rows to recognise your own file before committing to it, without rendering the import twice
export const SHEET_IMPORT_PREVIEW_ROW_COUNT = 5;
export const RESOURCE_DATE_FORMAT = "ddd, MMM D, YYYY h:mm A";
// Caps the chunked CSV export re-query so export cost stays bounded on huge lists
export const MAX_CSV_EXPORT_ROWS = 10_000;
export const DEFAULT_RESOURCE_SORT_BY = [
  { key: ItemMetadataPropertyNames.updatedAt, order: SortOrder.Desc },
] as const satisfies readonly SortItem<keyof Resource>[];
// Matches Vuetify's data-table default so the tracked value is correct before the first update:options
export const RESOURCE_LIST_ITEMS_PER_PAGE = 10;
export const RESOURCE_LIST_ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
