import type { UserHooks } from "#src/models/UserHooks";
import type { UserSettings } from "#src/models/UserSettings";

import { USER_SETTINGS_PATH } from "#src/services/constants";
import { parseJsonObject } from "#src/services/parseJsonObject";
import { existsSync, readFileSync } from "node:fs";

export const readUserSettings = (): UserSettings => {
  if (!existsSync(USER_SETTINGS_PATH)) return {};

  // The file is the person's to hand-edit, so the keys we read are each checked for their shape the way a hook
  // Payload's are; one shaped unlike the model is dropped, and setup or voice writes ours where it stood
  const { hooks, spinnerVerbs, statusLine, ...rest } = parseJsonObject(
    readFileSync(USER_SETTINGS_PATH, "utf8"),
  ) as UserSettings;
  const { MessageDisplay: messageDisplayEntries, ...otherHooks }: UserHooks = hooks ?? {};
  return {
    ...rest,
    ...(hooks && {
      hooks: {
        ...otherHooks,
        ...(Array.isArray(messageDisplayEntries) && {
          MessageDisplay: messageDisplayEntries.filter((entry) => Array.isArray(entry?.hooks)),
        }),
      },
    }),
    ...(Array.isArray(spinnerVerbs?.verbs) ? { spinnerVerbs } : {}),
    ...(typeof statusLine?.command === "string" ? { statusLine } : {}),
  };
};
