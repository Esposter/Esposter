import type { UserSettings } from "#src/models/UserSettings";

import { TIPS_PATH } from "#src/services/constants";
import { toForwardSlashes } from "#src/util/toForwardSlashes";

// `setup` ran and `teardown` has not: the tips file the settings name is ours
export const checkIsPluginSpinner = (settings: UserSettings): boolean =>
  settings.spinnerTipsOverride?.tipsFile === toForwardSlashes(TIPS_PATH);
