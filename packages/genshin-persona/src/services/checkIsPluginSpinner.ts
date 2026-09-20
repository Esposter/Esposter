import type { UserSettings } from "#src/models/UserSettings";

import { PLUGIN_MARKER, TIP_ID_MARKER_SEPARATOR } from "#src/services/constants";

// `setup` ran and `teardown` has not: the tips carry ids that are ours, whichever character's they are, which
// Nothing but our own write puts there. An override shaped unlike the model is nobody's, because the file is the
// Person's to hand-edit
export const checkIsPluginSpinner = ({ spinnerTipsOverride }: UserSettings): boolean =>
  Array.isArray(spinnerTipsOverride?.tips) &&
  spinnerTipsOverride.tips.some(
    (tip) => typeof tip?.id === "string" && tip.id.startsWith(`${PLUGIN_MARKER}${TIP_ID_MARKER_SEPARATOR}`),
  );
