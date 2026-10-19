import { KitEventKind } from "#src/models/kit/KitEventKind";
import { describe } from "vitest";

// The event of a character taking the field from the character it replaces
export const createCharacterSwapped = (characterId: number, previousCharacterId: number) => ({
  characterId,
  kind: KitEventKind.CharacterSwapped as const,
  previousCharacterId,
});

describe.todo("createCharacterSwapped");
