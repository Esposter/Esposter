import { MAX_BLUEPRINT_KEY_LENGTH } from "#shared/services/resource/blueprint/constants";
import { getBlueprintEntryKeys } from "@@/server/services/blueprint/getBlueprintEntryKeys";
import { RESOURCE_NAME_MAX_LENGTH } from "@esposter/db-schema";
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

  test("clamps a kebab-cased key that outgrew the manifest's own bound", () => {
    expect.hasAssertions();

    // Kebab-casing inserts a separator per word boundary, so an alternating-case name legal as a resource
    // Name produces a key longer than itself — and one over the bound writes an unreadable manifest
    const name = "Ab".repeat(RESOURCE_NAME_MAX_LENGTH / 2);
    const [key, suffixedKey] = getBlueprintEntryKeys([name, name]);

    expect(key).toHaveLength(MAX_BLUEPRINT_KEY_LENGTH);
    expect(suffixedKey).toHaveLength(MAX_BLUEPRINT_KEY_LENGTH);
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
