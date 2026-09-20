import type { CardedCharacter } from "#src/models/CardedCharacter";
import type { Character } from "#src/models/Character";

import { readPersonaCard } from "#src/services/readPersonaCard";

// Every card at once, for the two callers that read the roster rather than the session's one character: the lore
// Pick, and the authoring queues. The reads are concurrent because each is its own module
export const readCardedRoster = (roster: Character[]): Promise<CardedCharacter[]> =>
  Promise.all(roster.map(async (character) => ({ character, personaCard: await readPersonaCard(character.name) })));
