import type { Character } from "#src/models/Character";
import type { MonthDay } from "#src/models/MonthDay";

import { CARD_DETAIL_SEPARATOR } from "#src/services/constants";
import { getBirthdayLine } from "#src/services/getBirthdayLine";

export const getCard = (character: Character, today: MonthDay, voiceCard: string): string => {
  const details = [character.title, character.element, character.region].filter(Boolean).join(CARD_DETAIL_SEPARATOR);
  const headline = details ? `Persona: ${character.name} — ${details}` : `Persona: ${character.name}`;
  const birthdayLine = getBirthdayLine(character, today);
  return [headline, birthdayLine, voiceCard].filter(Boolean).join("\n");
};
