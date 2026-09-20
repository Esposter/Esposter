import type { Spinner } from "#src/models/Spinner";
import type { SpinnerContent } from "#src/models/SpinnerContent";
import type { SpinnerTip } from "#src/models/SpinnerTip";

import { BASE_TIP_ID, NAMEPLATE_PREFIX } from "#src/services/constants";
import { getPersonaCardName } from "#src/services/getPersonaCardName";

const getTips = (idPrefix: string, tips: string[]): SpinnerTip[] =>
  tips.map((text, index) => ({ id: `${idPrefix}-${index + 1}`, text }));

// The base content first and the character's behind it; a tip's id is stable across rewrites so its show history
// Survives the character changing
export const getSpinner = (base: SpinnerContent, name: string, content: SpinnerContent | undefined): Spinner => ({
  label: `${NAMEPLATE_PREFIX}${name}`,
  tips: [...getTips(BASE_TIP_ID, base.tips), ...getTips(getPersonaCardName(name), content?.tips ?? [])],
  verbs: [...base.verbs, ...(content?.verbs ?? [])],
});
