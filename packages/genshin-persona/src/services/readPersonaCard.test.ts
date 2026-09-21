import { MODULE_EXTENSION, PERSONA_CARDS_DIRECTORY } from "#src/services/constants";
import { getPersonaCardName } from "#src/services/getPersonaCardName";
import { getSpokenLines } from "#src/services/getSpokenLines";
import { readGenshinDb } from "#src/services/readGenshinDb";
import { readPersonaCard } from "#src/services/readPersonaCard";
import { readdirSync } from "node:fs";
import { extname } from "node:path";
import { describe, expect, test } from "vitest";

describe(readPersonaCard, () => {
  const names = readGenshinDb().characters("names", { matchCategories: true });

  // A card is found by the name derived from a character's, so a file that no name derives to is unreachable and
  // Fails nothing at runtime: the character simply has no card. The player character is the one name outside the
  // Game data, read from the constant the fallback path holds
  test("every card file is reachable through a character's name", () => {
    expect.hasAssertions();

    const reachableFileNames = new Set(names.map((name) => `${getPersonaCardName(name)}${MODULE_EXTENSION}`));
    const unreachableFileNames = readdirSync(PERSONA_CARDS_DIRECTORY).filter(
      (fileName) => extname(fileName) === MODULE_EXTENSION && !reachableFileNames.has(fileName),
    );

    expect(unreachableFileNames).toStrictEqual([]);
  });

  // The greeting is the model's example of a spoken line, so it is one the hook would read out whole: plain words,
  // With no stage direction or emphasis for the hook to strip, since a line written after it is read aloud
  test("every card's greeting reads whole as a spoken line", async () => {
    expect.hasAssertions();

    const cards = await Promise.all(names.map((name) => readPersonaCard(name)));
    const unspokenGreetings = cards
      .filter((card) => card !== undefined)
      .map(({ greeting }) => greeting)
      .filter((greeting) => getSpokenLines(`> ${greeting}`).join("\n") !== greeting);

    expect(unspokenGreetings).toStrictEqual([]);
  });
});
