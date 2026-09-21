import type { Character } from "#src/models/Character";
import type { PersonaCard } from "#src/models/PersonaCard";
import type { Spinner } from "#src/models/Spinner";

import { DEFAULT_LANGUAGE } from "#src/services/constants";
import { getSpinner } from "#src/services/getSpinner";
import { readLocalization } from "#src/services/readLocalization";
import { readVoiceLines } from "#src/services/readVoiceLines";

// The spinner for one character: the language's base content, that character's gerunds and every line of theirs —
// The game data, else the wiki, so never on a path the person waits behind. A character's gerunds are the card's
// Under English and the language's module otherwise, and a language whose module has none for them shows the base
// Verbs alone rather than English ones behind localized ones
export const readSpinner = async (
  character: Pick<Character, "displayName" | "name">,
  personaCard: PersonaCard | undefined,
  language: string,
): Promise<Spinner> => {
  const localization = await readLocalization(language);
  const lines = await readVoiceLines(character.name, language);
  const verbs =
    localization.characterVerbs[character.name] ?? (language === DEFAULT_LANGUAGE ? (personaCard?.verbs ?? []) : []);
  return getSpinner(localization, character, verbs, lines);
};
