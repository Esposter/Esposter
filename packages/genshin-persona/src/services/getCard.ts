import type { Card } from "#src/models/Card";
import type { Character } from "#src/models/Character";
import type { PersonaCard } from "#src/models/PersonaCard";
import type { ResolvedLocalization } from "#src/models/ResolvedLocalization";

import { CARD_DETAIL_SEPARATOR } from "#src/services/constants";
import { getBirthdayNote } from "#src/services/getBirthdayNote";

// The headline and the note are the plugin's own words about the character, so they are the interface language's.
// The authored card is not: its habits and sign-off reach the model alone, and its greeting is a line the model
// Performs rather than a label a person reads — the model renders all three in whatever language it answers in, so
// They stay as written and follow the reply language by themselves
export const getCard = (
  { birthday, description, displayElement, displayName, region, title }: Character,
  today: Temporal.PlainDate,
  localization: ResolvedLocalization,
  personaCard?: PersonaCard,
): Card => {
  const details = [title, displayElement, region].filter(Boolean).join(CARD_DETAIL_SEPARATOR);
  return {
    description,
    headline: details ? `${displayName} — ${details}` : displayName,
    note: getBirthdayNote(birthday, today, localization),
    personaCard,
  };
};
