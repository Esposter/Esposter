import { LEFT_DRAWER_WIDTH, RIGHT_DRAWER_WIDTH } from "#shared/services/app/constants";
import { RightDrawer } from "@/models/message/RightDrawer";

export const useLayoutStore = defineStore("message/ui/layout", () => {
  const rightDrawer = ref(RightDrawer.Member);
  // Sidebar widths are device-local UI state, so they persist per device instead of syncing
  const leftSideBarWidth = useLocalStorage("message-left-side-bar-width", LEFT_DRAWER_WIDTH);
  const rightSideBarWidth = useLocalStorage("message-right-side-bar-width", RIGHT_DRAWER_WIDTH);
  return {
    leftSideBarWidth,
    rightDrawer,
    rightSideBarWidth,
  };
});
