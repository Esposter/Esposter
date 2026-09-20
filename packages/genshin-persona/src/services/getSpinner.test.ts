import type { SpinnerContent } from "#src/models/SpinnerContent";

import { getSpinner } from "#src/services/getSpinner";
import { describe, expect, test } from "vitest";

describe(getSpinner, () => {
  const name = "Hu Tao";
  const base: SpinnerContent = { tips: ["baseTip"], verbs: ["baseVerb"] };
  const content: SpinnerContent = { tips: ["tip"], verbs: ["verb"] };

  test("puts the base verbs ahead of the character's and the character's tips alone under their name", () => {
    expect.hasAssertions();

    expect(getSpinner(base, name, content)).toStrictEqual({
      label: name,
      tips: [{ id: "genshin-persona.huTao-1", text: "tip" }],
      verbs: ["baseVerb", "verb"],
    });
  });

  test("shows the base tips under no name for a card without tips", () => {
    expect.hasAssertions();

    expect(getSpinner(base, name, { ...content, tips: [] })).toStrictEqual({
      label: "",
      tips: [{ id: "genshin-persona.teyvat-1", text: "baseTip" }],
      verbs: ["baseVerb", "verb"],
    });
  });

  test("shows the base content alone for a character nobody has written a card for", () => {
    expect.hasAssertions();

    expect(getSpinner(base, name, undefined)).toStrictEqual({
      label: "",
      tips: [{ id: "genshin-persona.teyvat-1", text: "baseTip" }],
      verbs: ["baseVerb"],
    });
  });
});
