import type { ChoiceResponse } from "@typesafe-ai/sdk";

import { createCharacter } from "#src/services/createCharacter.test";
import { getLoreRates } from "#src/services/getLoreRates";
import { describe, expect, test } from "vitest";

describe(getLoreRates, () => {
  const character = createCharacter({ displayName: "displayName", name: "name" });

  // The choice leads whatever its probability, the rest follow by theirs, and only the chart's rows are carried, so
  // The context carries exactly the odds the welcome prints
  test("carries the choice first, then the runners-up by probability, up to the chart's rows", () => {
    expect.hasAssertions();

    const response: ChoiceResponse = {
      choice: character.name,
      confidence: 0.2,
      probabilities: { a: 0.5, b: 0.1, c: 0.05, [character.name]: 0.2, d: 0.01 },
      type: "choice",
    };

    expect(getLoreRates(response, [character])).toStrictEqual([
      { displayName: "displayName", name: "name", probability: 0.2 },
      { displayName: "a", name: "a", probability: 0.5 },
      { displayName: "b", name: "b", probability: 0.1 },
      { displayName: "c", name: "c", probability: 0.05 },
    ]);
  });
});
