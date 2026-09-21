import type { Character } from "#src/models/Character";
import type { PersonaCard } from "#src/models/PersonaCard";
import type { Spinner } from "#src/models/Spinner";

import english from "#src/localizations/english";
import { getSpinner } from "#src/services/getSpinner";
import { readLocalization } from "#src/services/readLocalization";
import { readVoiceLines } from "#src/services/readVoiceLines";

// The spinner for one character: the language's base content, that character's gerunds and every line of theirs —
// The game data, else the wiki, so never on a path the person waits behind.
//
// A character's gerunds come from the language's module where it has them. Where it does not, the card's are shown
// Only if the base verbs beside them are English too — which is English itself, and equally a language whose module
// Is not written yet, since that inherits English. A language with its own base verbs and no gerunds for this
// Character shows the base verbs alone rather than two scripts in one list, and `readLocalization` answering
// English itself is exactly the test for that
export const readSpinner = async (
  character: Pick<Character, "displayName" | "name">,
  personaCard: PersonaCard | undefined,
  language: string,
): Promise<Spinner> => {
  const localization = await readLocalization(language);
  const lines = await readVoiceLines(character.name, language);
  const verbs =
    localization.characterVerbs[character.name] ?? (localization === english ? (personaCard?.verbs ?? []) : []);
  return getSpinner(localization, character, verbs, lines);
};
