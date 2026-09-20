import type { UserSettings } from "#src/models/UserSettings";

import { NAMEPLATE_PREFIX } from "#src/services/constants";

// `setup` ran and `teardown` has not: the tips carry our nameplate as their prefix
export const checkIsPluginSpinner = (settings: UserSettings): boolean =>
  settings.spinnerTipsOverride?.label.startsWith(NAMEPLATE_PREFIX) ?? false;
