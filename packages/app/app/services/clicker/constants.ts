import { VARIABLE_IDENTIFIER } from "#shared/services/clicker/constants";
import { dayjs } from "#shared/services/dayjs";

export const CLICKER_LOCAL_STORAGE_KEY = "clicker-store";
export const AUTOSAVE_INTERVAL = dayjs.duration(60, "seconds").asMilliseconds();
export const FPS = 60;

// We will parse data descriptions that are wrapped in the identifier
// and expose the clicker item properties to it
// e.g. #pluralName# will lookup the pluralName clicker item property
export const VARIABLE_REGEX = new RegExp(
  `${VARIABLE_IDENTIFIER}([^${VARIABLE_IDENTIFIER}]+)${VARIABLE_IDENTIFIER}`,
  "g",
);
