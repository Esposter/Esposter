import type { Spinner } from "#src/models/Spinner";

import { TIPS_PATH } from "#src/services/constants";
import { getSettingsWithSpinner } from "#src/services/getSettingsWithSpinner";
import { readUserSettings } from "#src/services/readUserSettings";
import { writeStateFile } from "#src/services/writeStateFile";
import { writeUserSettings } from "#src/services/writeUserSettings";
import { existsSync, readFileSync } from "node:fs";

// Both files are written only when they would change, so a session start touches nothing on most days: the
// Character changes with the calendar, and so does the spinner
export const writeSpinner = (spinner: Spinner): void => {
  const settings = readUserSettings();
  const newSettings = getSettingsWithSpinner(settings, spinner);
  if (JSON.stringify(newSettings) !== JSON.stringify(settings)) writeUserSettings(newSettings);

  const tips = `${JSON.stringify({ tips: spinner.tips }, null, 2)}\n`;
  const isCurrent = existsSync(TIPS_PATH) && readFileSync(TIPS_PATH, "utf8") === tips;
  if (!isCurrent) writeStateFile(TIPS_PATH, tips);
};
