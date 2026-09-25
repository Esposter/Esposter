import { DocsCategorySectionsMap } from "@/services/docs/DocsCategorySectionsMap";
import { getDocsSections } from "@/services/docs/getDocsSections.test";
import { describe, expect, test } from "vitest";

// A section the map does not name still renders, under the Products tab, so a new architecture or package area
// Would sit in the wrong tab with nothing to say so — the map is held to the tree instead
describe("docsCategorySectionsMap", () => {
  test("names every docs section once, and nothing else", async () => {
    expect.hasAssertions();

    const sections = await getDocsSections();

    expect(Object.values(DocsCategorySectionsMap).flat().toSorted()).toStrictEqual(sections);
  });
});
