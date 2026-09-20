import type { PersonaCard } from "#src/models/PersonaCard";
import type { Spinner } from "#src/models/Spinner";

import { BASE_SPINNER_CONTENT } from "#src/services/baseSpinnerContent";
import { getSpinner } from "#src/services/getSpinner";
import { readVoiceLines } from "#src/services/readVoiceLines";

// The spinner for one character: the card's verbs and every line of theirs — the game data, else the wiki, so
// Never on a path the person waits behind
export const readSpinner = async (name: string, personaCard: PersonaCard | undefined): Promise<Spinner> => {
  const lines = await readVoiceLines(name);
  return getSpinner(BASE_SPINNER_CONTENT, name, personaCard?.verbs ?? [], lines);
};
