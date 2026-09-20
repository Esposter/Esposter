import type { Card } from "#src/models/Card";
import type { Character } from "#src/models/Character";
import type { MonthDay } from "#src/models/MonthDay";

import { CARD_DETAIL_SEPARATOR } from "#src/services/constants";
import { getBirthdayNote } from "#src/services/getBirthdayNote";
import { parseVoiceCard } from "#src/services/parseVoiceCard";

export const getCard = (character: Character, today: MonthDay, voiceCardText: string): Card => {
  const details = [character.title, character.element, character.region].filter(Boolean).join(CARD_DETAIL_SEPARATOR);
  return {
    description: character.description,
    headline: details ? `${character.name} — ${details}` : character.name,
    note: getBirthdayNote(character.birthday, today),
    voiceCard: parseVoiceCard(voiceCardText),
  };
};
