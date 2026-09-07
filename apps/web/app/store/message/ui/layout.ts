import { LEFT_DRAWER_WIDTH, RIGHT_DRAWER_WIDTH } from "#shared/services/app/constants";
import { RightDrawer } from "@/models/message/RightDrawer";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";

export const useMessageLayoutStore = defineStore("message/ui/layout", () => {
  const rightDrawer = ref(RightDrawer.Member);
  // The pane pinned beside the thread in split view, and undefined when the drawer shows one pane. Opening a
  // Thread otherwise replaces whatever the drawer was showing, so a split is the only way to read a thread and
  // The member list — or a search's results — at once
  const splitRightDrawer = ref<RightDrawer>();
  // What the drawer was showing when the thread took it over, so a split reinstates that pane rather than a
  // Fixed default the user never chose
  const previousRightDrawer = ref(RightDrawer.Member);
  // Sidebar widths are device-local UI state, so they persist per device instead of syncing
  const leftSideBarWidth = useLocalStorage(LocalStorageKey.MessageLeftSideBarWidth, LEFT_DRAWER_WIDTH);
  const rightSideBarWidth = useLocalStorage(LocalStorageKey.MessageRightSideBarWidth, RIGHT_DRAWER_WIDTH);
  return {
    leftSideBarWidth,
    previousRightDrawer,
    rightDrawer,
    rightSideBarWidth,
    splitRightDrawer,
  };
});
