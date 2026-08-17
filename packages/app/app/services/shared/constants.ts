import { dayjs } from "#shared/services/dayjs";

export const BLANK_VALUE = "-";

export const AUTO_SEARCH_THROTTLE_MS = dayjs.duration(1, "second").asMilliseconds();

export const ITEM_TYPE_QUERY_PARAMETER_KEY = "itemType";

// `LocalStorageKey`'s own separator, deliberately not `ID_SEPARATOR`: these keys are already written into
// Browsers, so they carry the same compatibility contract a url format does and must stay free to diverge
export const LOCAL_STORAGE_KEY_SEPARATOR = ":";

export const DENSE_ICON_BUTTON_PROPS = Object.freeze({ class: "m-0", size: "small", tile: true });
