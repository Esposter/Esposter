import { LEFT_DRAWER_WIDTH, RIGHT_DRAWER_WIDTH } from "#shared/services/app/constants";
import { RightDrawer } from "@/models/message/RightDrawer";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";

export const useMessageLayoutStore = defineStore("message/ui/layout", () => {
  const rightDrawer = ref(RightDrawer.Member);
  // Sidebar widths are device-local UI state, so they persist per device instead of syncing
  const leftSideBarWidth = useLocalStorage(LocalStorageKey.MessageLeftSideBarWidth, LEFT_DRAWER_WIDTH);
  const rightSideBarWidth = useLocalStorage(LocalStorageKey.MessageRightSideBarWidth, RIGHT_DRAWER_WIDTH);
  return {
    leftSideBarWidth,
    rightDrawer,
    rightSideBarWidth,
  };
});
