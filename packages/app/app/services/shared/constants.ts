import { dayjs } from "#shared/services/dayjs";

export const BLANK_VALUE = "-";
// The one separator every composite key is built from — a mutation key over two ids, a per-key store slice, a
// Rendered :key, a list item id. Never a hyphen: uuids contain hyphens, so a hyphenated key cannot be split
// Back into its parts, and two conventions in one codebase means every new key picks one at random
export const COMPOSITE_KEY_SEPARATOR = ":";

export const AUTO_SEARCH_THROTTLE_MS = dayjs.duration(1, "second").asMilliseconds();

export const ITEM_TYPE_QUERY_PARAMETER_KEY = "itemType";

export const DENSE_ICON_BUTTON_PROPS = Object.freeze({ class: "m-0", size: "small", tile: true });
