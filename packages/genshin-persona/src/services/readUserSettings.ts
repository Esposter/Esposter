import type { UserSettings } from "#src/models/UserSettings";

import { USER_SETTINGS_PATH } from "#src/services/constants";
import { existsSync, readFileSync } from "node:fs";

export const readUserSettings = (): UserSettings => {
  if (!existsSync(USER_SETTINGS_PATH)) return {};

  // The file is the person's to hand-edit, so the two keys we read are each checked for their shape the way a hook
  // Payload's are; one shaped unlike the model is dropped, and setup writes ours where it stood
  // oxlint-disable-next-line no-restricted-properties
  const { spinnerVerbs, statusLine, ...rest } = JSON.parse(readFileSync(USER_SETTINGS_PATH, "utf8")) as UserSettings;
  return {
    ...rest,
    ...(Array.isArray(spinnerVerbs?.verbs) ? { spinnerVerbs } : {}),
    ...(typeof statusLine?.command === "string" ? { statusLine } : {}),
  };
};
