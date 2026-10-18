import { props } from "#src/components/Quest/Screen/Index.fixture";
import QuestScreen from "#src/components/Quest/Screen/Index.vue";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";

describe(QuestScreen, () => {
  // A series whose title has no words in the game's text, holding the quest the screen opens on: its journal is drawn
  // Empty, not left out, and nothing fails for want of a word
  test("a chapter with no words shows an empty journal", () => {
    expect.hasAssertions();

    render(QuestScreen, {
      props: {
        ...props,
        questChapters: [
          {
            id: "wordless",
            journalTextId: "wordless",
            numberTextId: "",
            questIds: ["an-ark-that-used-to-be-a-soul"],
            regionTextId: "snezhnaya",
            rewards: [],
            titleTextId: "wordless",
          },
        ],
      },
    });

    expect(document.querySelector(".journal")?.textContent).toBe("");
  });
});
