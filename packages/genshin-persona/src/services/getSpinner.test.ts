import type { SpinnerContent } from "#src/models/SpinnerContent";

import { getSpinner } from "#src/services/getSpinner";
import { describe, expect, test } from "vitest";

describe(getSpinner, () => {
  const name = "Hu Tao";
  const base: SpinnerContent = { tips: ["baseTip"], verbs: ["baseVerb"] };
  const content: SpinnerContent = { tips: ["tip"], verbs: ["verb"] };

  test("labels the spinner with the nameplate and puts the base content ahead of the character's", () => {
    expect.hasAssertions();

    expect(getSpinner(base, name, content)).toStrictEqual({
      label: `✦ ${name}`,
      tips: [
        { id: "teyvat-1", text: "baseTip" },
        { id: "hu-tao-1", text: "tip" },
      ],
      verbs: ["baseVerb", "verb"],
    });
  });

  test("shows the base content alone for a character nobody has written a card for", () => {
    expect.hasAssertions();

    expect(getSpinner(base, name, undefined)).toStrictEqual({
      label: `✦ ${name}`,
      tips: [{ id: "teyvat-1", text: "baseTip" }],
      verbs: ["baseVerb"],
    });
  });
});
