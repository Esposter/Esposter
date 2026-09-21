import type { Character } from "#src/models/Character";
import type { PersonaCard } from "#src/models/PersonaCard";

import english from "#src/localizations/english";
import { TEST_EPOCH_DATE } from "#src/services/constants.test";
import { getCard } from "#src/services/getCard";
import { readLocalization } from "#src/services/readLocalization";
import { describe, expect, test } from "vitest";

describe(getCard, () => {
  const greeting = "greeting";
  const character: Character = {
    affiliation: "",
    birthday: "",
    constellation: "",
    description: "",
    displayElement: "",
    displayName: "displayName",
    element: "",
    name: "Hu Tao",
    region: "",
    title: "",
    version: "",
    weapon: "",
  };
  const personaCard: PersonaCard = { greeting, habits: [], signOff: "signOff", verbs: [] };

  // The greeting is the one line of the card a person reads before the model has said anything, so it is the
  // Language's where the language has written it; the rest of the card stays the model's, as authored
  test("greets in the interface language where its module has the line, and leaves the model's card as written", async () => {
    expect.hasAssertions();

    const localization = await readLocalization("Japanese");
    const card = getCard(character, TEST_EPOCH_DATE, localization, personaCard);

    expect(card.greeting).toBe(localization.characters[character.name]?.greeting);
    expect(card.greeting).not.toBe(greeting);
    expect(card.personaCard).toBe(personaCard);
  });

  test.each([
    ["the card's own where the language has not written one", personaCard, greeting],
    ["nothing for a character with no card", undefined, ""],
  ])("greets with %s", (_, card, expected) => {
    expect.hasAssertions();

    expect(getCard(character, TEST_EPOCH_DATE, english, card).greeting).toBe(expected);
  });
});
