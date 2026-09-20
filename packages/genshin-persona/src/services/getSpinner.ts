import type { Spinner } from "#src/models/Spinner";
import type { SpinnerContent } from "#src/models/SpinnerContent";
import type { SpinnerTip } from "#src/models/SpinnerTip";

import { BASE_TIP_ID, PLUGIN_MARKER, TIP_ID_MARKER_SEPARATOR, TIP_ID_SEPARATOR } from "#src/services/constants";
import { getPersonaCardName } from "#src/services/getPersonaCardName";

const getTips = (idPrefix: string, tips: string[]): SpinnerTip[] =>
  tips.map((text, index) => ({
    id: `${PLUGIN_MARKER}${TIP_ID_MARKER_SEPARATOR}${idPrefix}${TIP_ID_SEPARATOR}${index + 1}`,
    text,
  }));

// The verbs are the base content with the character's behind it. The tips are one layer under one label: the
// Character's own under their name, else the base tips under the tool's own prefix, because a base tip is nobody's
// Line and a name in front of it reads as an attribution. A tip's id is stable across rewrites so its show history
// Survives the character changing
export const getSpinner = (base: SpinnerContent, name: string, content: SpinnerContent | undefined): Spinner => {
  const tips = content?.tips ?? [];
  const hasOwnTips = tips.length > 0;
  return {
    label: hasOwnTips ? name : "",
    tips: hasOwnTips ? getTips(getPersonaCardName(name), tips) : getTips(BASE_TIP_ID, base.tips),
    verbs: [...base.verbs, ...(content?.verbs ?? [])],
  };
};
