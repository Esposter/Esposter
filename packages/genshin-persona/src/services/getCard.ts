import type { Card } from "#src/models/Card";
import type { Character } from "#src/models/Character";
import type { PersonaCard } from "#src/models/PersonaCard";

import { CARD_DETAIL_SEPARATOR } from "#src/services/constants";
import { getBirthdayNote } from "#src/services/getBirthdayNote";

export const getCard = (
  character: Character,
  today: Temporal.PlainDate,
  personaCard: PersonaCard | undefined,
): Card => {
  const details = [character.title, character.element, character.region].filter(Boolean).join(CARD_DETAIL_SEPARATOR);
  return {
    description: character.description,
    headline: details ? `${character.name} — ${details}` : character.name,
    note: getBirthdayNote(character.birthday, today),
    personaCard,
  };
};
