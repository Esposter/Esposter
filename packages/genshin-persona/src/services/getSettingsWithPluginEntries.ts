import type { UserSettings } from "#src/models/UserSettings";

import { SpinnerVerbsMode } from "#src/models/SpinnerVerbsMode";
import { checkIsPluginStatusLine } from "#src/services/checkIsPluginStatusLine";
import { getAddedVerbs } from "#src/services/getAddedVerbs";
import { getPluginStatusLine } from "#src/services/getPluginStatusLine";

// Idempotent: our verbs are appended once behind the person's list, which keeps every entry it had and their order,
// And a status line that is not ours is left alone
export const getSettingsWithPluginEntries = (settings: UserSettings): UserSettings => {
  const priorVerbs = settings.spinnerVerbs?.verbs ?? [];
  const isForeignStatusLine = Boolean(settings.statusLine) && !checkIsPluginStatusLine(settings.statusLine);
  return {
    ...settings,
    spinnerVerbs: {
      mode: settings.spinnerVerbs?.mode ?? SpinnerVerbsMode.Append,
      verbs: [...priorVerbs, ...getAddedVerbs(settings)],
    },
    statusLine: isForeignStatusLine ? settings.statusLine : getPluginStatusLine(),
  };
};
