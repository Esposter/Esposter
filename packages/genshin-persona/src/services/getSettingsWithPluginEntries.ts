import type { UserSettings } from "#src/models/UserSettings";

import { SpinnerVerbsMode } from "#src/models/SpinnerVerbsMode";
import { checkIsPluginStatusLine } from "#src/services/checkIsPluginStatusLine";
import { SPINNER_VERBS } from "#src/services/constants";
import { getPluginStatusLine } from "#src/services/getPluginStatusLine";

// Idempotent: our verbs are appended once behind whatever the person already listed, and a status line that is
// Not ours is left alone
export const getSettingsWithPluginEntries = (settings: UserSettings): UserSettings => {
  const ownVerbs = settings.spinnerVerbs?.verbs.filter((verb) => !SPINNER_VERBS.includes(verb)) ?? [];
  const isForeignStatusLine = Boolean(settings.statusLine) && !checkIsPluginStatusLine(settings.statusLine);
  return {
    ...settings,
    spinnerVerbs: {
      mode: settings.spinnerVerbs?.mode ?? SpinnerVerbsMode.Append,
      verbs: [...ownVerbs, ...SPINNER_VERBS],
    },
    statusLine: isForeignStatusLine ? settings.statusLine : getPluginStatusLine(),
  };
};
