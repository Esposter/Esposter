import type { SpinnerContent } from "#src/models/SpinnerContent";
import type { VoiceLine } from "#src/models/VoiceLine";

import { MAX_SPINNER_TIP_COUNT, MAX_SPINNER_TIP_LENGTH } from "#src/services/constants";
import { getSpinner } from "#src/services/getSpinner";
import { describe, expect, test } from "vitest";

describe(getSpinner, () => {
  const name = "Hu Tao";
  const base: SpinnerContent = { tips: ["baseTip"], verbs: ["baseVerb"] };
  const verbs = ["verb"];
  const lines: VoiceLine[] = [{ text: "line", title: "title" }];

  test("puts the base verbs ahead of the character's and their lines under their name", () => {
    expect.hasAssertions();

    expect(getSpinner(base, name, verbs, lines)).toStrictEqual({
      label: name,
      tips: [{ id: "genshin-persona.huTao-1", text: "line" }],
      verbs: ["baseVerb", "verb"],
    });
  });

  test("cuts a line to the sentences that fit and drops one none of fits", () => {
    expect.hasAssertions();

    const longLines: VoiceLine[] = [
      { text: `line. ${"b".repeat(MAX_SPINNER_TIP_LENGTH)}`, title: "title" },
      { text: "b".repeat(MAX_SPINNER_TIP_LENGTH + 1), title: "title" },
    ];

    expect(getSpinner(base, name, verbs, longLines).tips).toStrictEqual([
      { id: "genshin-persona.huTao-1", text: "line." },
    ]);
  });

  test("cuts the tips where the tool stops reading them", () => {
    expect.hasAssertions();

    const manyLines = Array.from({ length: MAX_SPINNER_TIP_COUNT + 1 }, (_, index) => ({
      text: `${index}`,
      title: "title",
    }));

    expect(getSpinner(base, name, verbs, manyLines).tips).toHaveLength(MAX_SPINNER_TIP_COUNT);
  });

  test("shows the base tips under no name for a character with no lines", () => {
    expect.hasAssertions();

    expect(getSpinner(base, name, verbs, [])).toStrictEqual({
      label: "",
      tips: [{ id: "genshin-persona.teyvat-1", text: "baseTip" }],
      verbs: ["baseVerb", "verb"],
    });
  });

  test("shows the base content alone for a character with neither a card nor lines", () => {
    expect.hasAssertions();

    expect(getSpinner(base, name, [], [])).toStrictEqual({
      label: "",
      tips: [{ id: "genshin-persona.teyvat-1", text: "baseTip" }],
      verbs: ["baseVerb"],
    });
  });
});
