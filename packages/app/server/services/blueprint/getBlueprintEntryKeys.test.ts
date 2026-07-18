import { getBlueprintEntryKeys } from "@@/server/services/blueprint/getBlueprintEntryKeys";
import { describe, expect, test } from "vitest";

describe(getBlueprintEntryKeys, () => {
  test("kebab-cases names and disambiguates collisions", () => {
    expect.hasAssertions();

    expect(getBlueprintEntryKeys(["Audience Sheet", "Audience Sheet", "Funnel"])).toStrictEqual([
      "audience-sheet",
      "audience-sheet-2",
      "funnel",
    ]);
  });
});
