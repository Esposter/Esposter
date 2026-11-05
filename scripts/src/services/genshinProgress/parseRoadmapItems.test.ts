import { parseRoadmapItems } from "#src/services/genshinProgress/parseRoadmapItems";
import { describe, expect, test } from "vitest";

describe(parseRoadmapItems, () => {
  test("reads each item with the phase its heading names and its checkbox, and each phase heading's name", () => {
    expect.hasAssertions();

    expect(
      parseRoadmapItems(
        [
          "## References sought",
          "",
          "- [ ] **Sought.** A clip.",
          "",
          "## Phase 2: The interface",
          "",
          "- [ ] **Open.** Its words.",
          "- [x] **Done.** Its words.",
          "",
          "## Phase 3: The playable core",
          "",
          "- [ ] **Later.** Its words.",
          "",
        ].join("\n"),
      ),
    ).toStrictEqual({
      items: [
        { isDone: false, phase: undefined },
        { isDone: false, phase: 2 },
        { isDone: true, phase: 2 },
        { isDone: false, phase: 3 },
      ],
      names: new Map([
        [2, "The interface"],
        [3, "The playable core"],
      ]),
    });
  });
});
