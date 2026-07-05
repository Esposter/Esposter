import type { RightDrawer } from "@/models/message/RightDrawer";

import { useLayoutStore } from "@/store/layout";
import { useLayoutStore as useMessageLayoutStore } from "@/store/message/ui/layout";

export const useToggleRightDrawer = (drawer: RightDrawer) => {
  const layoutStore = useLayoutStore();
  const { isRightDrawerOpen } = storeToRefs(layoutStore);
  const messageLayoutStore = useMessageLayoutStore();
  const { rightDrawer } = storeToRefs(messageLayoutStore);
  const isOpen = computed(() => isRightDrawerOpen.value && rightDrawer.value === drawer);
  const toggle = () => {
    if (rightDrawer.value === drawer) isRightDrawerOpen.value = !isRightDrawerOpen.value;
    else {
      rightDrawer.value = drawer;
      isRightDrawerOpen.value = true;
    }
  };
  return { isOpen, toggle };
};
