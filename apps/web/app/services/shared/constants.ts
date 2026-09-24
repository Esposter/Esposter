import type { Item } from "@/models/shared/Item";

export const BLANK_VALUE = "-";

export const AUTO_SEARCH_THROTTLE_MS = Temporal.Duration.from({ seconds: 1 }).total("milliseconds");

export const COUNTDOWN_INTERVAL_MS = Temporal.Duration.from({ seconds: 1 }).total("milliseconds");

export const LOCAL_STORAGE_KEY_SEPARATOR = ":";

// A row is always in the map it was built from, so this only satisfies the lookup type
export const NO_ACTION_ITEMS: Item[] = [];
