import type { Character } from "#src/models/Character";
import type { VoiceLine } from "#src/models/VoiceLine";
import type { PersonaSpinner } from "#types";

import { MAX_SPINNER_TIP_COUNT } from "#src/services/constants";
import { cutSpinnerTip } from "#src/services/cutSpinnerTip";

// The verbs are the interface language's base content with the character's behind it. The tips are every line of
// The character's under the name that language spells them by, each cut to the sentences that fit — and for a
// Character with no lines anywhere yet, the game's one-line description of them, which the data package answers
// Localized for every character
export const getSpinner = (
  baseVerbs: string[],
  { description, displayName }: Pick<Character, "description" | "displayName">,
  verbs: string[],
  lines: VoiceLine[],
): PersonaSpinner => {
  const texts = lines.length > 0 ? lines.map(({ text }) => text) : [description];
  const tips = texts
    .map((text) => cutSpinnerTip(text))
    .filter(Boolean)
    .slice(0, MAX_SPINNER_TIP_COUNT);
  return { label: displayName, tips, verbs: [...baseVerbs, ...verbs] };
};
