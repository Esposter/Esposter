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

// The verbs are the base content with the character's behind it. The tips are one layer under one label: the
// Character's own under their name — the card's performed tips first, then every line of theirs, each cut to what
// The tool shows, once each, since a card's tip may quote a line — else the base tips under the tool's own
// Prefix, because a base tip is nobody's line and a name in front of it reads as an attribution. A tip's id is
// Stable across rewrites so its show history survives the character changing
export const getSpinner = (
  base: SpinnerContent,
  name: string,
  content: SpinnerContent | undefined,
  lines: VoiceLine[],
): Spinner => {
  const ownTips = new Set(
    [...(content?.tips ?? []), ...lines.map(({ text }) => text)].map((text) => cutSpinnerTip(text)),
  );
  const tips = [...ownTips].filter(Boolean).slice(0, MAX_SPINNER_TIP_COUNT);
  const hasOwnTips = tips.length > 0;
  return {
    label: hasOwnTips ? name : "",
    tips: hasOwnTips ? getTips(getPersonaCardName(name), tips) : getTips(BASE_TIP_ID, base.tips),
    verbs: [...base.verbs, ...(content?.verbs ?? [])],
  };
};
