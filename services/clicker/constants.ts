import { dayjs } from "@/services/dayjs";

export const SAVE_FILENAME = "save.json";
export const AUTOSAVE_INTERVAL = dayjs.duration(60, "seconds").asMilliseconds();
export const FPS = 60;

// local storage key
export const CLICKER_STORE = "clicker-store";
// We will parse data descriptions that are wrapped in the identifier
// and expose the clicker item properties to it
// e.g. #pluralName# will lookup the pluralName clicker item property
export const VARIABLE_IDENTIFIER = "#";
export const VARIABLE_REGEX = new RegExp(
  `${VARIABLE_IDENTIFIER}([^${VARIABLE_IDENTIFIER}]+)${VARIABLE_IDENTIFIER}`,
  "g",
);
