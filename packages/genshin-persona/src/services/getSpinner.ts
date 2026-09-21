import type { Character } from "#src/models/Character";
import type { Spinner } from "#src/models/Spinner";
import type { VoiceLine } from "#src/models/VoiceLine";

import {
  MAX_SPINNER_TIP_COUNT,
  PLUGIN_MARKER,
  TIP_ID_MARKER_SEPARATOR,
  TIP_ID_SEPARATOR,
} from "#src/services/constants";
import { cutSpinnerTip } from "#src/services/cutSpinnerTip";
import { getPersonaCardName } from "#src/services/getPersonaCardName";

// The verbs are the interface language's base content with the character's behind it. The tips are every line of
// The character's under the name that language spells them by, each cut to what the tool shows — and for a
// Character with no lines anywhere yet, the game's one-line description of them, which the data package answers
// Localized for every character and which keeps the tips ours: the ids are how the plugin knows the spinner is its
// Own, and an empty list carries none. A tip's id is keyed by the English name, so a show history survives both a
// Rewrite of the list and a change of interface language
export const getSpinner = (
  baseVerbs: string[],
  { description, displayName, name }: Pick<Character, "description" | "displayName" | "name">,
  verbs: string[],
  lines: VoiceLine[],
): Spinner => {
  const texts = lines.length > 0 ? lines.map(({ text }) => text) : [description];
  const tips = texts
    .map((text) => cutSpinnerTip(text))
    .filter(Boolean)
    .slice(0, MAX_SPINNER_TIP_COUNT);
  return {
    label: displayName,
    tips: tips.map((text, index) => ({
      id: `${PLUGIN_MARKER}${TIP_ID_MARKER_SEPARATOR}${getPersonaCardName(name)}${TIP_ID_SEPARATOR}${index + 1}`,
      text,
    })),
    verbs: [...baseVerbs, ...verbs],
  };
};
