import { RightDrawer } from "@/models/message/RightDrawer";
import { DEFAULT_SIDE_BAR_WIDTH } from "@/services/message/ui/constants";

export const useLayoutStore = defineStore("message/ui/layout", () => {
  const rightDrawer = ref(RightDrawer.Member);
  // Sidebar widths are device-local UI state, so they persist per device instead of syncing
  const leftSideBarWidth = useLocalStorage("message-left-side-bar-width", DEFAULT_SIDE_BAR_WIDTH);
  const rightSideBarWidth = useLocalStorage("message-right-side-bar-width", DEFAULT_SIDE_BAR_WIDTH);
  return {
    leftSideBarWidth,
    rightDrawer,
    rightSideBarWidth,
  };
});
