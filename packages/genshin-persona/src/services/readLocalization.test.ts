import english from "#src/localizations/english";
import japanese from "#src/localizations/japanese";
import { DEFAULT_LANGUAGE } from "#src/services/constants";
import { readLocalization } from "#src/services/readLocalization";
import { describe, expect, test } from "vitest";

describe(readLocalization, () => {
  test("answers English itself, which is the module every other inherits from", async () => {
    expect.hasAssertions();

    await expect(readLocalization(DEFAULT_LANGUAGE)).resolves.toBe(english);
  });

  // A language with no module is still localized everywhere the data package answers, so falling back here is a
  // Half-translated language rather than a broken one
  test("answers English for a language no module is written for", async () => {
    expect.hasAssertions();

    await expect(readLocalization("Turkish")).resolves.toBe(english);
  });

  test("takes the language's own base content", async () => {
    expect.hasAssertions();

    const localization = await readLocalization("Japanese");

    expect(localization.tips).toStrictEqual(japanese.tips);
    expect(localization.verbs).toStrictEqual(japanese.verbs);
    expect(localization.dateLocale).toBe("ja-JP");
  });

  test("fills every string, the language's own over English's", async () => {
    expect.hasAssertions();

    const { strings } = await readLocalization("Japanese");

    expect(Object.keys(strings).toSorted()).toStrictEqual(Object.keys(english.strings).toSorted());
    expect(strings.muted).toBe(japanese.strings.muted);
  });
});
