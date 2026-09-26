import type { PersonaCard } from "#src/models/PersonaCard";
import type { readVoiceLines as baseReadVoiceLines } from "#src/services/readVoiceLines";

import japanese from "#src/localizations/japanese";
import { DEFAULT_LANGUAGE } from "#src/services/constants";
import { readSpinner } from "#src/services/readSpinner";
import { describe, expect, test, vi } from "vitest";

// No character here has lines, since the gerunds are what these suites read
const { readVoiceLines } = vi.hoisted(() => ({
  readVoiceLines: vi.fn<typeof baseReadVoiceLines>(() => Promise.resolve([])),
}));

vi.mock(import("#src/services/readVoiceLines"), () => ({ readVoiceLines }));

describe(readSpinner, () => {
  const character = { description: "description", displayName: "胡桃", name: "Hu Tao" };
  const personaCard: PersonaCard = { greeting: "greeting", habits: [], signOff: "signOff", verbs: ["verb"] };

  test("takes a character's gerunds off the card under English", async () => {
    expect.hasAssertions();

    const { verbs } = await readSpinner(character, personaCard, DEFAULT_LANGUAGE);

    expect(verbs.at(-1)).toBe("verb");
  });

  test("takes them off the language's module under another language", async () => {
    expect.hasAssertions();

    const { verbs } = await readSpinner(character, personaCard, "Japanese");

    expect(verbs.slice(japanese.verbs.length)).toStrictEqual(japanese.characters["Hu Tao"]?.verbs);
  });

  // The card's gerunds are English, so showing them behind localized base verbs would put two scripts in one
  // Spinner; a character the language has no entry for shows the base verbs alone instead
  test("shows the base verbs alone for a character the language has no gerunds for", async () => {
    expect.hasAssertions();

    const { verbs } = await readSpinner(
      { description: "description", displayName: "name", name: "name" },
      personaCard,
      "Japanese",
    );

    expect(verbs).toStrictEqual(japanese.verbs);
  });

  // A language nobody has written a module for inherits English, base verbs included, so suppressing the card's
  // English gerunds there would lose verbs without ever mixing two scripts
  test("keeps the card's gerunds under a language whose module is not written yet", async () => {
    expect.hasAssertions();

    const { verbs } = await readSpinner(character, personaCard, " ");

    expect(verbs.at(-1)).toBe("verb");
  });
});
