import { PERSONA_CARD_EXTENSION, PERSONA_CARDS_DIRECTORY, TRAVELER } from "#src/services/constants";
import { getPersonaCardName } from "#src/services/getPersonaCardName";
import { readGenshinDb } from "#src/services/readGenshinDb";
import { readPersonaCard } from "#src/services/readPersonaCard";
import { extname } from "node:path";
import { readdirSync } from "node:fs";
import { describe, expect, test } from "vitest";

describe(readPersonaCard, () => {
  // A card is found by the name derived from a character's, so a file that no name derives to is unreachable and
  // Fails nothing at runtime: the character simply has no card. The player character is the one name outside the
  // Game data, read from the constant the fallback path holds
  test("every card file is reachable through a character's name", () => {
    expect.hasAssertions();

    const genshindb = readGenshinDb();
    const names = [...genshindb.characters("names", { matchCategories: true }), TRAVELER.name];
    const reachableFileNames = new Set(names.map((name) => `${getPersonaCardName(name)}${PERSONA_CARD_EXTENSION}`));
    const unreachableFileNames = readdirSync(PERSONA_CARDS_DIRECTORY).filter(
      (fileName) => extname(fileName) === PERSONA_CARD_EXTENSION && !reachableFileNames.has(fileName),
    );

    expect(unreachableFileNames).toStrictEqual([]);
  });
});
