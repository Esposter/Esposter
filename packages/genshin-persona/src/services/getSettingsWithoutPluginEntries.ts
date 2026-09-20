import type { UserSettings } from "#src/models/UserSettings";

import { checkIsPluginStatusLine } from "#src/services/checkIsPluginStatusLine";
import { SPINNER_VERBS } from "#src/services/constants";

// The inverse of setup: only what we wrote is removed, and a key left with nothing in it is dropped
export const getSettingsWithoutPluginEntries = (settings: UserSettings): UserSettings => {
  const { spinnerVerbs, statusLine, ...rest } = settings;
  const ownVerbs = spinnerVerbs?.verbs.filter((verb) => !SPINNER_VERBS.includes(verb)) ?? [];
  return {
    ...rest,
    ...(spinnerVerbs && ownVerbs.length > 0 ? { spinnerVerbs: { mode: spinnerVerbs.mode, verbs: ownVerbs } } : {}),
    ...(statusLine && !checkIsPluginStatusLine(statusLine) ? { statusLine } : {}),
  };
};
