import type { Character } from "#src/models/Character";

// Whole-name, case-insensitive, against the English name and the one the interface language shows: the one way a
// Pin or a typed name is matched, by the hook and the skill alike. Both are matched because the status line and the
// Card show the localized name, so that is the name a person copies
export const findCharacterByName = (roster: Character[], name: string): Character | undefined =>
  name
    ? roster.find(
        (character) =>
          character.name.toLowerCase() === name.toLowerCase() ||
          character.displayName.toLowerCase() === name.toLowerCase(),
      )
    : undefined;
