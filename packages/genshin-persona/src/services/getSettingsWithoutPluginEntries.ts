import type { UserSettings } from "#src/models/UserSettings";

import { checkIsPluginSpinner } from "#src/services/checkIsPluginSpinner";
import { checkIsPluginStatusLine } from "#src/services/checkIsPluginStatusLine";

// The inverse of setup: the spinner keys go together, because setup wrote them together, and a status line that is
// Not ours stays
export const getSettingsWithoutPluginEntries = (settings: UserSettings): UserSettings => {
  const { spinnerTipsOverride, spinnerVerbs, statusLine, ...rest } = settings;
  const foreignSpinner = checkIsPluginSpinner(settings)
    ? {}
    : { ...(spinnerTipsOverride && { spinnerTipsOverride }), ...(spinnerVerbs && { spinnerVerbs }) };
  return {
    ...rest,
    ...foreignSpinner,
    ...(statusLine && !checkIsPluginStatusLine(statusLine) && { statusLine }),
  };
};
