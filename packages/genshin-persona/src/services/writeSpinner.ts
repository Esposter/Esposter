import type { Spinner } from "#src/models/Spinner";

import { getSettingsWithSpinner } from "#src/services/getSettingsWithSpinner";
import { readUserSettings } from "#src/services/readUserSettings";
import { writeUserSettings } from "#src/services/writeUserSettings";

// Written only when it would change, so a session start touches nothing on most days: the character changes with
// The calendar, and so does the spinner. The tool reads the spinner keys once per process, so a write shows from the
// Next session, never the one that wrote it
export const writeSpinner = (spinner: Spinner): void => {
  const settings = readUserSettings();
  const newSettings = getSettingsWithSpinner(settings, spinner);
  if (JSON.stringify(newSettings) !== JSON.stringify(settings)) writeUserSettings(newSettings);
};
