import { getTocLinkIds } from "@/services/docs/getTocLinkIds";
import { describe, expect, test } from "vitest";

describe(getTocLinkIds, () => {
  // Document order, not level order: the scrollspy pairs each id with the next one to decide where a section
  // Ends, so a child listed after its parent's sibling would end that section at the wrong heading
  test("flattens nested links depth first", () => {
    expect.hasAssertions();

    const links = [
      {
        children: [
          { depth: 3, id: "storage-split", text: "text" },
          { depth: 3, id: "service-map", text: "text" },
        ],
        depth: 2,
        id: "architecture",
        text: "text",
      },
      { depth: 2, id: "testing", text: "text" },
    ];

    expect(getTocLinkIds(links)).toStrictEqual(["architecture", "storage-split", "service-map", "testing"]);
  });
});
