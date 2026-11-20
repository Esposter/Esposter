import type { PersonaCard } from "#src/models/PersonaCard";

import { CharacterNamePersonaReferenceMap } from "#src/generated/CharacterNamePersonaReferenceMap";

// The line one character's voice is cloned from: the ear's, written in the card, over the measured one, generated
// Beside it — and "" for a character neither has reached, whom the synthesizer speaks from the longest line the
// Wiki lists
export const getCharacterReference = (name: string, personaCard: PersonaCard | undefined): string =>
  personaCard?.reference ?? CharacterNamePersonaReferenceMap[name]?.stem ?? "";
