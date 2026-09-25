import { DocsSectionIconMap } from "@/services/docs/DocsSectionIconMap";
import { getDocsSections } from "@/services/docs/getDocsSections.test";
import { describe, expect, test } from "vitest";

// A section the map does not name falls back to a generic book, which renders fine and so is never noticed
describe("docsSectionIconMap", () => {
  test("names every docs section, and nothing else", async () => {
    expect.hasAssertions();

    const sections = await getDocsSections();

    expect(Object.keys(DocsSectionIconMap).toSorted()).toStrictEqual(sections);
  });
});
