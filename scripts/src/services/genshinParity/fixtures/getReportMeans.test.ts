import { getReportMeans } from "#src/services/genshinParity/fixtures/getReportMeans";
import { describe, expect, test } from "vitest";

describe(getReportMeans, () => {
  test("A committed row's mean is read from its cell, padded to the table's width", () => {
    expect.hasAssertions();

    const report = [
      "| Reference | Screen | Mean difference | Shape | Tone | FLIP |",
      "| :-- | :-- | --: | --: | --: | --: |",
      "| `quest-screen`   | `QuestScreen`    |    2.11% | 0.941 |  1.02% | 0.1004 |",
      "| `crafting-table` | `CraftingScreen` | pending: its recording is not on disk |  |  |  |",
    ].join("\n");

    expect(getReportMeans(report)).toStrictEqual(new Map([["quest-screen", 2.11]]));
  });
});
