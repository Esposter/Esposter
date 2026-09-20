import type { UserSettings } from "#src/models/UserSettings";

import { SPINNER_VERBS } from "#src/services/constants";

// The verbs `setup` would add to this settings file: ours, minus any the person listed first, because a verb that
// Was already there is theirs and `teardown` must leave it behind
export const getAddedVerbs = (settings: UserSettings): string[] => {
  const priorVerbs = settings.spinnerVerbs?.verbs ?? [];
  return SPINNER_VERBS.filter((verb) => !priorVerbs.includes(verb));
};
