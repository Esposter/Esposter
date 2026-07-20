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

  test("bumps a suffixed key past another name's natural key", () => {
    expect.hasAssertions();

    expect(getBlueprintEntryKeys(["Audience Sheet", "Audience Sheet", "Audience Sheet 2"])).toStrictEqual([
      "audience-sheet",
      "audience-sheet-2",
      "audience-sheet-2-2",
    ]);
  });

  test("bumps a natural key claimed by an earlier suffixed key", () => {
    expect.hasAssertions();

    expect(getBlueprintEntryKeys(["Audience Sheet 2", "Audience Sheet", "Audience Sheet"])).toStrictEqual([
      "audience-sheet-2",
      "audience-sheet",
      "audience-sheet-3",
    ]);
  });
});
