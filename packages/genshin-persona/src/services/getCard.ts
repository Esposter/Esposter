import type { Card } from "#src/models/Card";
import type { Character } from "#src/models/Character";
import type { PersonaCard } from "#src/models/PersonaCard";
import type { ResolvedLocalization } from "#src/models/ResolvedLocalization";

import { CARD_DETAIL_SEPARATOR } from "#src/services/constants";
import { getBirthdayNote } from "#src/services/getBirthdayNote";

// The headline, the note and the greeting are what a person reads, so they are the interface language's: the first
// Two are the plugin's own words about the character, and the greeting is the language's module's where it has one
// And the card's otherwise. The rest of the authored card reaches the model alone and stays as written — a model
// Reading the habits and the sign-off in English answers in whatever language it was asked to, register intact
export const getCard = (
  { birthday, description, displayElement, displayName, name, region, title }: Character,
  today: Temporal.PlainDate,
  localization: ResolvedLocalization,
  personaCard?: PersonaCard,
): Card => {
  const details = [title, displayElement, region].filter(Boolean).join(CARD_DETAIL_SEPARATOR);
  return {
    description,
    greeting: localization.characters[name]?.greeting ?? personaCard?.greeting ?? "",
    headline: details ? `${displayName} — ${details}` : displayName,
    name,
    note: getBirthdayNote(birthday, today, localization),
    personaCard,
  };
};
