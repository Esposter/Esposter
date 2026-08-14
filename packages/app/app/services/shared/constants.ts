import { dayjs } from "#shared/services/dayjs";

export const BLANK_VALUE = "-";

export const AUTO_SEARCH_THROTTLE_MS = dayjs.duration(1, "second").asMilliseconds();

export const ITEM_TYPE_QUERY_PARAMETER_KEY = "itemType";

export const DENSE_ICON_BUTTON_PROPS = Object.freeze({ class: "m-0", size: "small", tile: true });
