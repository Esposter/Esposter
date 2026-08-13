import { dayjs } from "#shared/services/dayjs";

export const RESOURCE_SEARCH_LIMIT = 5;
export const RECENT_SEARCHES_LIMIT = 5;
export const RESOURCE_SEARCH_DEBOUNCE_MS = dayjs.duration(300, "milliseconds").asMilliseconds();
export const RESOURCE_SEARCH_LISTBOX_ID = "resource-search-listbox";
