import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { ResourceListItemPropertyNames } from "#shared/models/resource/ResourceListItem";
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
] as const satisfies readonly SortItem<keyof ResourceListItem>[];
// What Recent means: newest open first. Rows this device — any device — has never opened are filtered out
// Of that view entirely, so the null case never reaches the sort
export const LAST_ACCESSED_RESOURCE_SORT_BY = [
  { key: ResourceListItemPropertyNames.lastAccessedAt, order: SortOrder.Desc },
] as const satisfies readonly SortItem<keyof ResourceListItem>[];
// Every list shows the same columns, and last-access is the one most readers never sort or filter by — it
// Earns its space on Recent, which pins it, and is an opt-in everywhere else
export const DEFAULT_HIDDEN_RESOURCE_COLUMN_KEYS: string[] = [ResourceListItemPropertyNames.lastAccessedAt];
// Matches Vuetify's data-table default so the tracked value is correct before the first update:options
export const RESOURCE_LIST_ITEMS_PER_PAGE = 10;
export const RESOURCE_LIST_ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
