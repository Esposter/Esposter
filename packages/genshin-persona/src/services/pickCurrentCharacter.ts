import type { Character } from "#src/models/Character";
import type { Today } from "#src/models/Today";

import { pickCharacter } from "#src/services/pickCharacter";
import { pickCharacterByLore } from "#src/services/pickCharacterByLore";
import { readTypeSafeKey } from "#src/services/readTypeSafeKey";

// What a session starting now is given. With a typed-decision key the lore pick decides, asked afresh every time
// Because it is cheap and a little variety between sessions is the point; the birthday pick stands in when it
// Cannot answer, and is the whole answer without a key
export const pickCurrentCharacter = async (roster: Character[], today: Today): Promise<Character | undefined> => {
  const key = readTypeSafeKey();
  const loreCharacter = key ? await pickCharacterByLore(roster, today, key) : undefined;
  return loreCharacter ?? pickCharacter(roster, today.monthDay, today.isoDate);
};
