import english from "#src/localizations/english";
import japanese from "#src/localizations/japanese";
import { readGenshinDb } from "#src/services/readGenshinDb";
import { describe, expect, test } from "vitest";

// The module is data rather than behaviour, so what is checked is the two ways its data can be wrong without
// Anything failing at runtime: a key that reaches no character, and a base list that lost an entry against the
// Language it was written from. A character the module has no verbs for is not a fault — that is the queue the
// `untranslated` verb prints, and a patch refills it
describe("japanese", () => {
  test("every character it names is one the roster holds", () => {
    expect.hasAssertions();

    const names = new Set(readGenshinDb().characters("names", { matchCategories: true }));
    const unreachableNames = Object.keys(japanese.characterVerbs).filter((name) => !names.has(name));

    expect(unreachableNames).toStrictEqual([]);
  });

  test.each(["tips", "verbs"] as const)("has as many base %s as English", (key) => {
    expect.hasAssertions();

    expect(japanese[key]).toHaveLength(english[key].length);
  });

  test("shares no base verb with English, which would be an untranslated entry", () => {
    expect.hasAssertions();

    expect(japanese.verbs.filter((verb) => english.verbs.includes(verb))).toStrictEqual([]);
  });
});
