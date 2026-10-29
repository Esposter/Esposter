import { QUEST_TAB_NEXT_CODE, QUEST_TAB_PREVIOUS_CODE } from "#src/services/quest/constants";
import { useEventListener } from "@vueuse/core";

// Q and E step a list screen's tab one place along, held at the first and the last. The screen gives its open tab's
// index and its tab count, and is handed the index a step lands on to select. The stepping is returned, so the screen's
// own controls that move the same way land on the same tab
export const useListScreenTabStep = (
  getTabIndex: () => number,
  getTabCount: () => number,
  selectTab: (tabIndex: number) => void,
) => {
  const getSteppedTabIndex = (step: number): number => Math.min(Math.max(getTabIndex() + step, 0), getTabCount() - 1);
  useEventListener("keydown", (event) => {
    if (event.code === QUEST_TAB_NEXT_CODE) selectTab(getSteppedTabIndex(1));
    else if (event.code === QUEST_TAB_PREVIOUS_CODE) selectTab(getSteppedTabIndex(-1));
  });
  return getSteppedTabIndex;
};
