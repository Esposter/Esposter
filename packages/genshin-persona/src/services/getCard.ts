import type { Card } from "#src/models/Card";
import type { Character } from "#src/models/Character";
import type { MonthDay } from "#src/models/MonthDay";

import { CARD_DETAIL_SEPARATOR } from "#src/services/constants";
import { getBirthdayNote } from "#src/services/getBirthdayNote";

export const getCard = (character: Character, today: MonthDay, voiceCard: string): Card => {
  const details = [character.title, character.element, character.region].filter(Boolean).join(CARD_DETAIL_SEPARATOR);
  return {
    headline: details ? `${character.name} — ${details}` : character.name,
    note: getBirthdayNote(character.birthday, today),
    voiceCard,
  };
};
