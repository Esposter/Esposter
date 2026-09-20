import type { UserSettings } from "#src/models/UserSettings";

import { checkIsPluginStatusLine } from "#src/services/checkIsPluginStatusLine";

// The inverse of setup: only the verbs `setup` recorded itself as having added are removed, so a verb the person
// Listed before the plugin arrived survives its teardown, and a key left with nothing in it is dropped
export const getSettingsWithoutPluginEntries = (settings: UserSettings, addedVerbs: string[]): UserSettings => {
  const { spinnerVerbs, statusLine, ...rest } = settings;
  const keptVerbs = spinnerVerbs?.verbs.filter((verb) => !addedVerbs.includes(verb)) ?? [];
  return {
    ...rest,
    ...(spinnerVerbs && keptVerbs.length > 0 ? { spinnerVerbs: { mode: spinnerVerbs.mode, verbs: keptVerbs } } : {}),
    ...(statusLine && !checkIsPluginStatusLine(statusLine) ? { statusLine } : {}),
  };
};
