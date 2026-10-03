import type { VoiceLine } from "#src/models/VoiceLine";

import { MAX_SPINNER_TIP_COUNT, MAX_SPINNER_TIP_LENGTH } from "#src/services/constants";
import { getSpinner } from "#src/services/getSpinner";
import { describe, expect, test } from "vitest";

describe(getSpinner, () => {
  const displayName = "胡桃";
  const character = { description: "description", displayName };
  const baseVerbs = ["baseVerb"];
  const verbs = ["verb"];
  const lines: VoiceLine[] = [{ text: "line", title: "title" }];

  test("puts the base verbs ahead of the character's and their lines under their name", () => {
    expect.hasAssertions();

    expect(getSpinner(baseVerbs, character, verbs, lines)).toStrictEqual({
      label: displayName,
      tips: ["line"],
      verbs: ["baseVerb", "verb"],
    });
  });

  test("cuts a line to the sentences that fit and drops one none of fits", () => {
    expect.hasAssertions();

    const longLines: VoiceLine[] = [
      { text: `line. ${"b".repeat(MAX_SPINNER_TIP_LENGTH)}`, title: "title" },
      { text: "b".repeat(MAX_SPINNER_TIP_LENGTH + 1), title: "title" },
    ];

    expect(getSpinner(baseVerbs, character, verbs, longLines).tips).toStrictEqual(["line."]);
  });

  test("caps the tips the session holds", () => {
    expect.hasAssertions();

    const manyLines = Array.from({ length: MAX_SPINNER_TIP_COUNT + 1 }, (_, index) => ({
      text: `${index}`,
      title: "title",
    }));

    expect(getSpinner(baseVerbs, character, verbs, manyLines).tips).toHaveLength(MAX_SPINNER_TIP_COUNT);
  });

  test("shows the description under the name for a character with no lines", () => {
    expect.hasAssertions();

    expect(getSpinner(baseVerbs, character, [], [])).toStrictEqual({
      label: displayName,
      tips: ["description"],
      verbs: ["baseVerb"],
    });
  });
});
