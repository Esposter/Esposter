import type { Character } from "#src/models/Character";
import type { GenshinContext } from "#src/models/GenshinContext";

import { findCharacterByName } from "#src/services/findCharacterByName";

// The character a verb names by its argument, or nothing once the argument names none — which every such verb answers
// The same way, so the refusal and its exit code are said here rather than at each
export const findNamedCharacter = ({ roster, strings }: GenshinContext, name: string): Character | undefined => {
  const character = findCharacterByName(roster, name);
  if (!character) {
    console.error(strings.noCharacterNamed(name));
    process.exitCode = 1;
  }

  return character;
};
