import type { UserSettings } from "#src/models/UserSettings";

import { USER_SETTINGS_PATH } from "#src/services/constants";
import { existsSync, readFileSync } from "node:fs";

export const readUserSettings = (): UserSettings => {
  if (!existsSync(USER_SETTINGS_PATH)) return {};

  // The file is the tool's own, a plain object with no date in it, and the two keys read are typed by the model
  // oxlint-disable-next-line no-restricted-properties
  return JSON.parse(readFileSync(USER_SETTINGS_PATH, "utf8")) as UserSettings;
};
