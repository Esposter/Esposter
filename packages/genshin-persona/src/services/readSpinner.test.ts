import type { PersonaCard } from "#src/models/PersonaCard";
import type { readVoiceLines as baseReadVoiceLines } from "#src/services/readVoiceLines";

import japanese from "#src/localizations/japanese";
import { DEFAULT_LANGUAGE } from "#src/services/constants";
import { readSpinner } from "#src/services/readSpinner";
import { describe, expect, test, vi } from "vitest";

const { readVoiceLines } = vi.hoisted(() => ({ readVoiceLines: vi.fn<typeof baseReadVoiceLines>() }));

vi.mock(import("#src/services/readVoiceLines"), () => ({ readVoiceLines }));

describe(readSpinner, () => {
  const character = { displayName: "胡桃", name: "Hu Tao" };
  const personaCard: PersonaCard = {
    greeting: "greeting",
    habits: [],
    signOff: "signOff",
    verbs: ["Marketing"],
  };

  test("takes a character's gerunds off the card under English", async () => {
    expect.hasAssertions();
    readVoiceLines.mockResolvedValue([]);

    const { verbs } = await readSpinner(character, personaCard, DEFAULT_LANGUAGE);

    expect(verbs.at(-1)).toBe("Marketing");
  });

  test("takes them off the language's module under another language", async () => {
    expect.hasAssertions();
    readVoiceLines.mockResolvedValue([]);

    const { verbs } = await readSpinner(character, personaCard, "Japanese");

    expect(verbs.slice(japanese.verbs.length)).toStrictEqual(japanese.characterVerbs["Hu Tao"]);
  });

  // The card's gerunds are English, so showing them behind localized base verbs would put two scripts in one
  // Spinner; a character the language has no entry for shows the base verbs alone instead
  test("shows the base verbs alone for a character the language has no gerunds for", async () => {
    expect.hasAssertions();
    readVoiceLines.mockResolvedValue([]);

    const { verbs } = await readSpinner({ displayName: "name", name: "name" }, personaCard, "Japanese");

    expect(verbs).toStrictEqual(japanese.verbs);
  });
});
