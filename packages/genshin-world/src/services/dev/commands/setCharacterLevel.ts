import type { DevSaveOutcome } from "#src/models/dev/DevSaveOutcome";
import type { DevSaveTables } from "#src/models/dev/DevSaveTables";
import type { GenshinSave } from "#src/models/save/GenshinSave";

import { resolveDevName } from "#src/services/dev/resolveDevName";
import { z } from "zod";

// The `level` line: a held character by the name the game shows it under, and the level to set it to
export const setCharacterLevelArgumentsSchema = z.object({
  character: z.string().min(1),
  level: z.coerce.number().int().min(1),
});

export type SetCharacterLevelArguments = z.infer<typeof setCharacterLevelArgumentsSchema>;

// Sets a held character's level, the save's own level field the game's level-ups write.
// The level is clamped to the highest level its ascension allows.
// A character the save does not hold is not among the names a line can give
export const setCharacterLevel = (
  save: GenshinSave,
  { character, level }: SetCharacterLevelArguments,
  tables: Pick<DevSaveTables, "characterDataMap" | "nameText">,
): DevSaveOutcome => {
  const heldCharacters = save.characters.flatMap((savedCharacter) => {
    const characterData = tables.characterDataMap.get(savedCharacter.id);
    return characterData ? [{ characterData, savedCharacter }] : [];
  });
  const resolution = resolveDevName(
    heldCharacters,
    ({ characterData }) => tables.nameText[characterData.nameTextId] ?? "",
    character,
    "character",
  );
  if (!resolution.ok) return resolution;

  const { characterData, savedCharacter } = resolution.entry;
  const maxLevel = characterData.ascensionPhases[savedCharacter.ascension]?.maxLevel;
  if (maxLevel === undefined)
    return { error: `${character} has no ascension phase ${savedCharacter.ascension}`, ok: false };

  const nextLevel = Math.min(level, maxLevel);
  return {
    ok: true,
    save: {
      ...save,
      characters: save.characters.map((saved) =>
        saved.id === savedCharacter.id ? { ...saved, level: nextLevel } : saved,
      ),
    },
    value: nextLevel,
  };
};
