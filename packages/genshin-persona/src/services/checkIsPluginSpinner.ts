import type { UserSettings } from "#src/models/UserSettings";

import { BASE_TIP_ID, TIP_ID_SEPARATOR } from "#src/services/constants";

// `setup` ran and `teardown` has not: a base tip's id is in the list, which nothing but our own write puts there,
// And every install has written it. An override shaped unlike the model is nobody's, because the file is the
// Person's to hand-edit
export const checkIsPluginSpinner = ({ spinnerTipsOverride }: UserSettings): boolean =>
  Array.isArray(spinnerTipsOverride?.tips) &&
  spinnerTipsOverride.tips.some(
    (tip) => typeof tip?.id === "string" && tip.id.startsWith(`${BASE_TIP_ID}${TIP_ID_SEPARATOR}`),
  );
