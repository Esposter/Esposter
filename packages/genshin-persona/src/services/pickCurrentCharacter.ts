import type { Character } from "#src/models/Character";
import type { SessionPick } from "#src/models/SessionPick";

import { pickCharacter } from "#src/services/pickCharacter";
import { pickCharacterByLore } from "#src/services/pickCharacterByLore";
import { readTypeSafeKey } from "#src/services/readTypeSafeKey";

// What a session starting now is given. With a typed-decision key the lore pick decides, asked afresh every time
// Because it is cheap and a little variety between sessions is the point; the birthday pick stands in when it
// Cannot answer, carrying why, and is the whole answer without a key
export const pickCurrentCharacter = async (
  roster: Character[],
  today: Temporal.PlainDate,
): Promise<SessionPick | undefined> => {
  const key = readTypeSafeKey();
  const lorePick = key ? await pickCharacterByLore(roster, today, key) : undefined;
  if (lorePick && "character" in lorePick)
    return { character: lorePick.character, loreFailure: "", loreResponse: lorePick.response };

  const character = pickCharacter(roster, today);
  return character ? { character, loreFailure: lorePick?.failure ?? "" } : undefined;
};
