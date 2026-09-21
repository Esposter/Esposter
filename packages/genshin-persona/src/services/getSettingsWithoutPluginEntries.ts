import type { UserHooks } from "#src/models/UserHooks";
import type { UserSettings } from "#src/models/UserSettings";

import { checkIsPluginHookEntry } from "#src/services/checkIsPluginHookEntry";
import { checkIsPluginSpinner } from "#src/services/checkIsPluginSpinner";
import { checkIsPluginStatusLine } from "#src/services/checkIsPluginStatusLine";

// The inverse of setup and of voice: the spinner keys go together, because setup wrote them together, a status
// Line that is not ours stays, and so does every hook entry that is not ours — the event's list, and the hooks
// Key itself, going only once nothing is left on them
export const getSettingsWithoutPluginEntries = (settings: UserSettings): UserSettings => {
  const { hooks, spinnerTipsOverride, spinnerVerbs, statusLine, ...rest } = settings;
  const foreignSpinner = checkIsPluginSpinner(settings)
    ? {}
    : { ...(spinnerTipsOverride && { spinnerTipsOverride }), ...(spinnerVerbs && { spinnerVerbs }) };
  const { MessageDisplay: messageDisplayEntries = [], ...otherHooks }: UserHooks = hooks ?? {};
  const foreignEntries = messageDisplayEntries.filter((entry) => !checkIsPluginHookEntry(entry));
  const foreignHooks = { ...otherHooks, ...(foreignEntries.length > 0 && { MessageDisplay: foreignEntries }) };
  return {
    ...rest,
    ...foreignSpinner,
    ...(Object.keys(foreignHooks).length > 0 && { hooks: foreignHooks }),
    ...(statusLine && !checkIsPluginStatusLine(statusLine) && { statusLine }),
  };
};
