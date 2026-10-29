import { props } from "#src/components/Quest/Screen/Index.fixture";
import QuestScreen from "#src/components/Quest/Screen/Index.vue";
import { QUEST_TAB_NEXT_CODE } from "#src/services/quest/constants";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { nextTick } from "vue";

describe(QuestScreen, () => {
  // E steps along the tabs, the first being the list of every quest, and holds at the last
  test("E steps along the tabs and holds at the last", async () => {
    expect.hasAssertions();

    await render(QuestScreen, { props });
    const tabs = document.querySelectorAll('[role="tab"]');
    const getSelectedTabIndex = () => [...tabs].findIndex((tab) => tab.getAttribute("aria-selected") === "true");
    const pressNext = async (count: number) => {
      for (let press = 0; press < count; press++)
        window.dispatchEvent(new KeyboardEvent("keydown", { code: QUEST_TAB_NEXT_CODE }));
      await nextTick();
    };

    expect(getSelectedTabIndex()).toBe(0);
    await pressNext(1);
    expect(getSelectedTabIndex()).toBe(1);
    await pressNext(10);
    expect(getSelectedTabIndex()).toBe(tabs.length - 1);
  });

  // A series whose title has no words in the game's text, holding the quest the screen opens on: its journal is drawn
  // Empty, not left out, and nothing fails for want of a word
  test("a chapter with no words shows an empty journal", async () => {
    expect.hasAssertions();

    await render(QuestScreen, {
      props: {
        ...props,
        questChapters: [
          {
            id: "-1",
            journalTextId: "-1",
            numberTextId: "",
            questIds: ["an-ark-that-used-to-be-a-soul"],
            regionTextId: "snezhnaya",
            rewards: [],
            titleTextId: "-1",
          },
        ],
      },
    });

    expect(document.querySelector(".journal")?.textContent).toBe("");
  });
});
