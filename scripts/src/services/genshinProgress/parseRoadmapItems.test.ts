import { parseRoadmapItems } from "#src/services/genshinProgress/parseRoadmapItems";
import { describe, expect, test } from "vitest";

describe(parseRoadmapItems, () => {
  test("reads each item with the phase its heading names, its checkbox and the quest it names, and each phase heading's name", () => {
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
          "- [ ] **Wanderer's Trail (quest 351).** Its words.",
          "",
        ].join("\n"),
      ),
    ).toStrictEqual({
      items: [
        { isDone: false, phase: undefined, quest: undefined },
        { isDone: false, phase: 2, quest: undefined },
        { isDone: true, phase: 2, quest: undefined },
        { isDone: false, phase: 3, quest: undefined },
        { isDone: false, phase: 3, quest: "351" },
      ],
      names: new Map([
        [2, "The interface"],
        [3, "The playable core"],
      ]),
    });
  });
});
