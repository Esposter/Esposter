import type { Character } from "#src/models/Character";
import type { GenshinContext } from "#src/models/GenshinContext";

import { printCard } from "#src/services/cli/printCard";
import { recordSessionCharacter } from "#src/services/recordSessionCharacter";

// The session speaks as the character from the reply that relays the card: its record is rewritten so every later
// Start, the hooks module and the speech agree; the module reads the record again behind the verb's answer
export const switchSessionCharacter = async (context: GenshinContext, character: Character): Promise<void> => {
  recordSessionCharacter(character, context.sessionId, context.today.toString());
  await printCard(context, character);
};
