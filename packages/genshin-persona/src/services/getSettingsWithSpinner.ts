import type { Spinner } from "#src/models/Spinner";
import type { UserSettings } from "#src/models/UserSettings";

import { SpinnerVerbsMode } from "#src/models/SpinnerVerbsMode";
import { TIPS_PATH } from "#src/services/constants";
import { toForwardSlashes } from "#src/util/toForwardSlashes";

// The plugin owns both spinner keys outright: the built-in verbs and tips are replaced, not joined
export const getSettingsWithSpinner = (settings: UserSettings, spinner: Spinner): UserSettings => ({
  ...settings,
  spinnerTipsOverride: { excludeDefault: true, label: spinner.label, tipsFile: toForwardSlashes(TIPS_PATH) },
  spinnerVerbs: { mode: SpinnerVerbsMode.Replace, verbs: spinner.verbs },
});
