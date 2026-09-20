import type { SpinnerContent } from "#src/models/SpinnerContent";
import type { VoiceLine } from "#src/models/VoiceLine";

import { MAX_SPINNER_TIP_COUNT } from "#src/services/constants";
import { getSpinner } from "#src/services/getSpinner";
import { describe, expect, test } from "vitest";

describe(getSpinner, () => {
  const name = "Hu Tao";
  const base: SpinnerContent = { tips: ["baseTip"], verbs: ["baseVerb"] };
  const content: SpinnerContent = { tips: ["tip"], verbs: ["verb"] };
  const lines: VoiceLine[] = [{ text: "line", title: "title" }];

  test("puts the base verbs ahead of the character's and the card's tips ahead of their lines under their name", () => {
    expect.hasAssertions();

    expect(getSpinner(base, name, content, lines)).toStrictEqual({
      label: name,
      tips: [
        { id: "genshin-persona.huTao-1", text: "tip" },
        { id: "genshin-persona.huTao-2", text: "line" },
      ],
      verbs: ["baseVerb", "verb"],
    });
  });

  test("shows a line a card tip quotes once", () => {
    expect.hasAssertions();

    expect(getSpinner(base, name, content, [{ text: "tip", title: "title" }]).tips).toStrictEqual([
      { id: "genshin-persona.huTao-1", text: "tip" },
    ]);
  });

  test("cuts the tips where the tool stops reading them", () => {
    expect.hasAssertions();

    const manyLines = Array.from({ length: MAX_SPINNER_TIP_COUNT + 1 }, (_, index) => ({
      text: `${index}`,
      title: "title",
    }));

    expect(getSpinner(base, name, undefined, manyLines).tips).toHaveLength(MAX_SPINNER_TIP_COUNT);
  });

  test("shows the lines alone under the name for a card without tips", () => {
    expect.hasAssertions();

    expect(getSpinner(base, name, { ...content, tips: [] }, lines)).toStrictEqual({
      label: name,
      tips: [{ id: "genshin-persona.huTao-1", text: "line" }],
      verbs: ["baseVerb", "verb"],
    });
  });

  test("shows the base tips under no name for a character with neither tips nor lines", () => {
    expect.hasAssertions();

    expect(getSpinner(base, name, { ...content, tips: [] }, [])).toStrictEqual({
      label: "",
      tips: [{ id: "genshin-persona.teyvat-1", text: "baseTip" }],
      verbs: ["baseVerb", "verb"],
    });
  });

  test("shows the base content alone for a character nobody has written a card for or lines of", () => {
    expect.hasAssertions();

    expect(getSpinner(base, name, undefined, [])).toStrictEqual({
      label: "",
      tips: [{ id: "genshin-persona.teyvat-1", text: "baseTip" }],
      verbs: ["baseVerb"],
    });
  });
});
