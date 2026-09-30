import type { Character } from "#src/models/Character";
import type { GenshinContext } from "#src/models/GenshinContext";

import { findCharacterByName } from "#src/services/findCharacterByName";
import { readPin } from "#src/services/readPin";
import { resolveSessionCharacter } from "#src/services/resolveSessionCharacter";

// This session's character when run inside one, else the pin, else a fresh pick: the resolution the start hook runs,
// So `today` answers who is speaking now. Under the lore pick a fresh ask may answer differently, which is the point
// Of it, and a fresh ask the tier did not answer says so beside the birthday pick that stood in
export const getCurrentCharacter = async ({
  roster,
  sessionId,
  strings,
  today,
}: GenshinContext): Promise<Character | undefined> => {
  const pin = readPin();
  if (pin && !findCharacterByName(roster, pin.name)) console.log(strings.pinIgnored(pin.name));

  const pick = await resolveSessionCharacter(roster, sessionId, today);
  if (pick?.loreFailure) console.log(strings.lorePickUnanswered(pick.loreFailure));
  return pick?.character;
};
