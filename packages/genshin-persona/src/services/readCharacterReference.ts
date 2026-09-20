import type { PersonaCard } from "#src/models/PersonaCard";

import { PersonaReferenceMap } from "#src/generated/PersonaReferenceMap";

// The line one character's voice is cloned from: the ear's, written in the card, over the measured one, generated
// Beside it — and "" for a character neither has reached, whom the synthesizer speaks from the longest line the
// Wiki lists
export const readCharacterReference = (name: string, personaCard: PersonaCard | undefined): string =>
  personaCard?.reference ?? PersonaReferenceMap[name]?.stem ?? "";
