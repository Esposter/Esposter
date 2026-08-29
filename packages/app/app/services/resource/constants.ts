import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { ResourceListItemPropertyNames } from "#shared/models/resource/ResourceListItem";
import { ItemMetadataPropertyNames } from "@esposter/shared";

// How long a pending "G" chord prefix stays armed before the second key must be pressed
export const KEY_CHORD_TIMEOUT_MS = Temporal.Duration.from({ seconds: 1 }).total("milliseconds");
// One shared cadence for every edit-triggered autosave — injected by the autosave wrappers so call sites never restate it
export const RESOURCE_AUTOSAVE_DEBOUNCE_MS = 500;
export const RECENT_RESOURCES_LIMIT = 5;
// Enough parsed rows to recognise your own file before committing to it, without rendering the import twice
export const SHEET_IMPORT_PREVIEW_ROW_COUNT = 5;
// The string form, for the csv export and the table-header accessors that sort on it. Anything rendered for a
// Reader takes the attribute form below instead, so it formats in the reader's own locale and timezone
export const RESOURCE_DATE_FORMAT = "ddd, MMM D, YYYY h:mm A";
export const RESOURCE_DATE_TIME_ATTRIBUTES = {
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  weekday: "short",
  year: "numeric",
} as const;
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
