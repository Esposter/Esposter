import type { UserSettings } from "#src/models/UserSettings";

import { USER_SETTINGS_PATH } from "#src/services/constants";
import { writeFileSync } from "node:fs";

// Two-space JSON with a trailing newline, the shape the tool itself writes the file in
export const writeUserSettings = (settings: UserSettings): void => {
  writeFileSync(USER_SETTINGS_PATH, `${JSON.stringify(settings, null, 2)}\n`);
};
