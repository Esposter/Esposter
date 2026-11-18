import AchievementScreen from "#src/components/Achievement/Screen/Index.vue";
import { props } from "#src/components/Achievement/Screen/Index.fixture";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";

describe("achievementScreen", () => {
  // The traced marks the screen draws in their stand-ins' places: the header's laurel, a category's badge, an achievement's medal
  // And stamp ring, and the frame's corner ornaments and bottom tab
  const MARK_CLASSES = [
    "mark-laurel",
    "mark-category-badge",
    "mark-medal",
    "mark-stamp-ring",
    "mark-frame-corner-top-left",
    "mark-frame-corner-top-right",
    "mark-frame-corner-bottom-left",
    "mark-frame-corner-bottom-right",
    "mark-frame-tab",
  ];

  test("a traced mark replaces its flat stand-in on the achievement screen", async () => {
    expect.hasAssertions();

    await render(AchievementScreen, { props });

    for (const markClass of MARK_CLASSES)
      expect(document.querySelector(`.achievement-screen svg.${markClass} > path[d]`)).not.toBeNull();
  });
});
