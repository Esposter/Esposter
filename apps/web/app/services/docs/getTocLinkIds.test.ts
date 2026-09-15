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
          { depth: 3, id: "b", text: "text" },
          { depth: 3, id: "c", text: "text" },
        ],
        depth: 2,
        id: "a",
        text: "text",
      },
      { depth: 2, id: "d", text: "text" },
    ];

    expect(getTocLinkIds(links)).toStrictEqual(["a", "b", "c", "d"]);
  });
});
