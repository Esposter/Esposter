import type { UserSettings } from "#src/models/UserSettings";

import { BASE_TIP_ID } from "#src/services/constants";

// `setup` ran and `teardown` has not: a base tip's id is in the list, which nothing but our own write puts there,
// And every install has written it. The nameplate the label carries is decoration a person's own spinner could have
// Chosen, and reading ownership off it would overwrite what they wrote; an override shaped unlike the model is
// Nobody's, because the file is theirs to hand-edit
export const checkIsPluginSpinner = ({ spinnerTipsOverride }: UserSettings): boolean =>
  Array.isArray(spinnerTipsOverride?.tips) &&
  spinnerTipsOverride.tips.some((tip) => typeof tip?.id === "string" && tip.id.startsWith(BASE_TIP_ID));
