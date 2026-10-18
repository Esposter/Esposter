import type { LoreRate } from "#src/models/LoreRate";

import english from "#src/localizations/english";
import { formatLoreChart } from "#src/services/formatLoreChart";
import { describe, expect, test } from "vitest";

describe(formatLoreChart, () => {
  // The rows arrive already ordered, the choice first, so the chart prints them as they come and scales the bars to
  // The longest of them
  test("prints the rows in order, aligned in three columns", () => {
    expect.hasAssertions();

    const rates: LoreRate[] = [
      { displayName: "displayName", name: "name", probability: 0.2 },
      { displayName: "a", name: "a", probability: 0.5 },
      { displayName: "b", name: "b", probability: 0.1 },
      { displayName: "c", name: "c", probability: 0.05 },
    ];

    expect(formatLoreChart(rates, english)).toBe(
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
