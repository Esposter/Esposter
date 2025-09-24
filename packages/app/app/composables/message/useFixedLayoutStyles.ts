import type { CSSProperties } from "vue";

import { APP_BAR_HEIGHT, LEFT_DRAWER_WIDTH, RIGHT_DRAWER_WIDTH } from "#shared/services/app/constants";
import { useLayoutStore } from "@/store/layout";

export const useFixedLayoutStyles = () => {
  const layoutStore = useLayoutStore();
  const { isLeftDrawerOpen, isRightDrawerOpen } = storeToRefs(layoutStore);
  const leftOffset = computed(() => (isLeftDrawerOpen.value ? 0 : -LEFT_DRAWER_WIDTH));
  const rightOffset = computed(() => (isRightDrawerOpen.value ? 0 : -RIGHT_DRAWER_WIDTH));
  const middleLeftOffset = computed(() => (isLeftDrawerOpen.value ? LEFT_DRAWER_WIDTH : 0));
  const middleRightOffset = computed(() => (isRightDrawerOpen.value ? RIGHT_DRAWER_WIDTH : 0));
  return {
    bottom: computed<CSSProperties>(() => ({
      bottom: "0px",
      left: `${middleLeftOffset.value}px`,
      position: "fixed",
      transform: "translateY(0px)",
      width: `calc(100% - ${middleLeftOffset.value + middleRightOffset.value}px)`,
      zIndex: 1004,
    })),
    left: computed<CSSProperties>(() => ({
      bottom: "0px",
      height: `calc(100% - ${APP_BAR_HEIGHT}px)`,
      left: `${leftOffset.value}px`,
      position: "fixed",
      top: `${APP_BAR_HEIGHT}px`,
      transform: "translateX(0px)",
      width: `${LEFT_DRAWER_WIDTH}px`,
      zIndex: 1008,
    })),
    middle: computed<CSSProperties>(() => ({
      "--v-layout-bottom": `151px`,
      "--v-layout-left": `${middleLeftOffset.value}px`,
      "--v-layout-right": `${middleRightOffset.value}px`,
      "--v-layout-top": `${APP_BAR_HEIGHT}px`,
    })),
    right: computed<CSSProperties>(() => ({
      bottom: "0px",
      height: `calc(100% - ${APP_BAR_HEIGHT}px)`,
      position: "fixed",
      right: `${rightOffset.value}px`,
      top: `${APP_BAR_HEIGHT}px`,
      transform: "translateX(0px)",
      width: `${RIGHT_DRAWER_WIDTH}px`,
      zIndex: 1006,
    })),
  };
};
