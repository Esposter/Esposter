import type { Spinner } from "#src/models/Spinner";
import type { UserSettings } from "#src/models/UserSettings";

import { SpinnerVerbsMode } from "#src/models/SpinnerVerbsMode";

// The plugin owns both spinner keys outright: the built-in verbs and tips are replaced, not joined
export const getSettingsWithSpinner = (settings: UserSettings, spinner: Spinner): UserSettings => ({
  ...settings,
  spinnerTipsOverride: { excludeDefault: true, tips: spinner.tips },
  spinnerVerbs: { mode: SpinnerVerbsMode.Replace, verbs: spinner.verbs },
});
