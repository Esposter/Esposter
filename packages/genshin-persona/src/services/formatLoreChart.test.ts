import type { ChoiceResponse } from "@typesafe-ai/sdk";

import english from "#src/localizations/english";
import { createCharacter } from "#src/services/createCharacter.test";
import { formatLoreChart } from "#src/services/formatLoreChart";
import { describe, expect, test } from "vitest";

describe(formatLoreChart, () => {
  const character = createCharacter({ displayName: "displayName", name: "name" });

  // The choice leads whatever its probability, the rest follow by theirs, and the roster's own spelling of a name
  // Is drawn where it has one
  test("draws the choice first, then the runners-up by probability, aligned in three columns", () => {
    expect.hasAssertions();

    const response: ChoiceResponse = {
      choice: character.name,
      confidence: 0.2,
      probabilities: { a: 0.5, b: 0.1, c: 0.05, [character.name]: 0.2, d: 0.01 },
      type: "choice",
    };

    expect(formatLoreChart(response, [character], english)).toBe(
      [
        "Picked by lore; the tier's leaning:",
        "▇▇▇▇▇▇▇▇             20% displayName",
        "▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇ 50% a",
        "▇▇▇▇                 10% b",
        "▇▇                    5% c",
      ].join("\n"),
    );
  });
});
