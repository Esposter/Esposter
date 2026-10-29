import { formatGameTextMatch } from "#src/services/genshinText/formatGameTextMatch";
import { GameLanguage } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(formatGameTextMatch, () => {
  const CORRIDOR_NAME = "UI_TOWER_CORRIDOR";
  const CORRIDOR_HASH = "1";
  const ENGLISH_TAG = "en";
  const FRENCH_TAG = "fr";

  test("a plain line is the name, then each language's string in the order the languages are asked for", () => {
    expect.hasAssertions();

    const match = {
      id: CORRIDOR_HASH,
      key: "AbyssCorridor",
      name: CORRIDOR_NAME,
      values: { [ENGLISH_TAG]: "Corridor", [FRENCH_TAG]: "Couloir" },
    };

    expect(formatGameTextMatch(match, [GameLanguage.English, GameLanguage.French], false)).toBe(
      `${CORRIDOR_NAME}\t"Corridor"\t"Couloir"`,
    );
  });

  test("a plain line with no name starts at the id, and a language the match lacks is an empty string", () => {
    expect.hasAssertions();

    const match = { id: CORRIDOR_HASH, values: { [ENGLISH_TAG]: "Corridor" } };

    expect(formatGameTextMatch(match, [GameLanguage.English, GameLanguage.French], false)).toBe(
      `${CORRIDOR_HASH}\t"Corridor"\t""`,
    );
  });

  test("a JSON line is the match as it is, with the fields it lacks left out", () => {
    expect.hasAssertions();

    const match = { id: CORRIDOR_HASH, values: { [ENGLISH_TAG]: "Corridor" } };

    expect(formatGameTextMatch(match, [GameLanguage.English], true)).toBe(
      `{"id":"${CORRIDOR_HASH}","values":{"${ENGLISH_TAG}":"Corridor"}}`,
    );
  });
});
