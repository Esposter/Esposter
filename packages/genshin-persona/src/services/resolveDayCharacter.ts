import type { Character } from "#src/models/Character";
import type { Today } from "#src/models/Today";

import { findCharacterByName } from "#src/services/findCharacterByName";
import { pickCharacter } from "#src/services/pickCharacter";
import { pickCharacterByLore } from "#src/services/pickCharacterByLore";
import { readDayPick } from "#src/services/readDayPick";
import { readTypeSafeKey } from "#src/services/readTypeSafeKey";
import { writeDayPick } from "#src/services/writeDayPick";

// The day's character, settled once: the first session of a day picks and every later one reads the pick back,
// So a pick that asks a model still answers the same for the whole day. With a typed-decision key the lore pick
// Decides and the birthday pick stands in when it cannot; without one the birthday pick is the whole answer
export const resolveDayCharacter = async (roster: Character[], today: Today): Promise<Character | undefined> => {
  const dayPick = readDayPick();
  const knownCharacter = dayPick?.isoDate === today.isoDate ? findCharacterByName(roster, dayPick.name) : undefined;
  if (knownCharacter) return knownCharacter;

  const key = readTypeSafeKey();
  const loreCharacter = key ? await pickCharacterByLore(roster, today, key) : undefined;
  const character = loreCharacter ?? pickCharacter(roster, today.monthDay, today.isoDate);
  if (character) writeDayPick({ element: character.element, isoDate: today.isoDate, name: character.name });
  return character;
};
