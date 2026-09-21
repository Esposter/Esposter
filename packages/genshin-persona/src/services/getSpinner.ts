import type { Character } from "#src/models/Character";
import type { Spinner } from "#src/models/Spinner";
import type { SpinnerContent } from "#src/models/SpinnerContent";
import type { SpinnerTip } from "#src/models/SpinnerTip";
import type { VoiceLine } from "#src/models/VoiceLine";

import {
  BASE_TIP_ID,
  MAX_SPINNER_TIP_COUNT,
  PLUGIN_MARKER,
  TIP_ID_MARKER_SEPARATOR,
  TIP_ID_SEPARATOR,
} from "#src/services/constants";
import { cutSpinnerTip } from "#src/services/cutSpinnerTip";
import { getPersonaCardName } from "#src/services/getPersonaCardName";

const getTips = (idPrefix: string, tips: string[]): SpinnerTip[] =>
  tips.map((text, index) => ({
    id: `${PLUGIN_MARKER}${TIP_ID_MARKER_SEPARATOR}${idPrefix}${TIP_ID_SEPARATOR}${index + 1}`,
    text,
  }));

// The verbs are the interface language's base content with the character's behind it. The tips are one layer under
// One label: every line of the character's under the name that language spells them by, each cut to what the tool
// Shows, else the base tips under the tool's own prefix, because a base tip is nobody's line and a name in front of
// It reads as an attribution. A tip's id is keyed by the English name, so a show history survives both a rewrite of
// The list and a change of interface language
export const getSpinner = (
  base: SpinnerContent,
  { displayName, name }: Pick<Character, "displayName" | "name">,
  verbs: string[],
  lines: VoiceLine[],
): Spinner => {
  const tips = lines
    .map(({ text }) => cutSpinnerTip(text))
    .filter(Boolean)
    .slice(0, MAX_SPINNER_TIP_COUNT);
  const hasOwnTips = tips.length > 0;
  return {
    label: hasOwnTips ? displayName : "",
    tips: hasOwnTips ? getTips(getPersonaCardName(name), tips) : getTips(BASE_TIP_ID, base.tips),
    verbs: [...base.verbs, ...verbs],
  };
};
