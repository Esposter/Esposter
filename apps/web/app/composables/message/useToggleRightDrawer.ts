import type { RightDrawer } from "@/models/message/RightDrawer";

import { useLayoutStore } from "@/store/layout";
import { useMessageLayoutStore } from "@/store/message/ui/layout";

export const useToggleRightDrawer = (drawer: RightDrawer) => {
  const layoutStore = useLayoutStore();
  const { isRightDrawerOpen } = storeToRefs(layoutStore);
  const messageLayoutStore = useMessageLayoutStore();
  const { openRightDrawer } = messageLayoutStore;
  const { rightDrawer } = storeToRefs(messageLayoutStore);
  const isOpen = computed(() => isRightDrawerOpen.value && rightDrawer.value === drawer);
  const toggle = () => {
    if (rightDrawer.value === drawer) isRightDrawerOpen.value = !isRightDrawerOpen.value;
    else openRightDrawer(drawer);
  };
  return { isOpen, toggle };
};
