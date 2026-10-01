import type { Localization } from "#src/models/Localization";

import { GameLanguages } from "#src/generated/genshinText/models/GameLanguage";
import english from "#src/localizations/english";
import { DEFAULT_LANGUAGE, LOCALIZATIONS_DIRECTORY } from "#src/services/constants";
import { readGenshinDb } from "#src/services/readGenshinDb";
import { readPersonaCard } from "#src/services/readPersonaCard";
import { readPersonaModule } from "#src/services/readPersonaModule";
import { describe, expect, test } from "vitest";

// A module is data rather than behaviour, so what is checked is the ways its data can be wrong without anything
// Failing at runtime: a key that reaches no character, a base list that lost an entry against the language it was
// Written from, an English word or greeting pasted into the slot meant for its translation, and a string left to
// English. A character a module has no entry for is not a fault — that is the queue the `untranslated` verb prints,
// And a patch refills it
describe("localizations", async () => {
  const names = new Set(readGenshinDb().characters("names", { matchCategories: true }));
  const languages = GameLanguages.filter((language) => language !== DEFAULT_LANGUAGE);
  const localizations = await Promise.all(
    languages.map(async (language) => {
      const localization = await readPersonaModule<Localization>(LOCALIZATIONS_DIRECTORY, language);
      return [language, localization] as const;
    }),
  );

  test.each(languages)("%s has a module", (language) => {
    expect.hasAssertions();

    expect(localizations.find(([moduleLanguage]) => moduleLanguage === language)?.[1]).toBeDefined();
  });

  describe.each(localizations)("%s", (_language, localization) => {
    test("names only characters the roster holds", () => {
      expect.hasAssertions();

      const unreachableNames = Object.keys(localization?.characters ?? {}).filter((name) => !names.has(name));

      expect(unreachableNames).toStrictEqual([]);
    });

    test("has as many distinct base verbs as English, none of them English's", () => {
      expect.hasAssertions();

      const verbs = localization?.verbs ?? [];

      expect(new Set(verbs).size).toBe(english.verbs.length);
      expect(verbs.filter((verb) => english.verbs.includes(verb))).toStrictEqual([]);
    });

    test("fills every string", () => {
      expect.hasAssertions();

      expect(Object.keys(localization?.strings ?? {}).toSorted()).toStrictEqual(
        Object.keys(english.strings).toSorted(),
      );
    });

    // A greeting equal to the card's is the English line pasted into the queue's slot, which the welcome would then
    // Show under a headline in another language — the very thing the entry exists to end
    test("greets nobody in the card's own English words", async () => {
      expect.hasAssertions();

      const personaCards = await Promise.all(
        Object.entries(localization?.characters ?? {}).map(
          async ([name, { greeting }]) => [greeting, await readPersonaCard(name)] as const,
        ),
      );

      expect(personaCards.filter(([greeting, personaCard]) => greeting === personaCard?.greeting)).toStrictEqual([]);
    });
  });
});
