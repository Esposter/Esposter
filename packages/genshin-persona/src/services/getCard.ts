import type { Card } from "#src/models/Card";
import type { Character } from "#src/models/Character";
import type { PersonaCard } from "#src/models/PersonaCard";

import { CARD_DETAIL_SEPARATOR } from "#src/services/constants";
import { getBirthdayNote } from "#src/services/getBirthdayNote";

export const getCard = (
  { birthday, description, element, name, region, title }: Character,
  today: Temporal.PlainDate,
  personaCard?: PersonaCard,
): Card => {
  const details = [title, element, region].filter(Boolean).join(CARD_DETAIL_SEPARATOR);
  return {
    description,
    headline: details ? `${name} — ${details}` : name,
    note: getBirthdayNote(birthday, today),
    personaCard,
  };
};
