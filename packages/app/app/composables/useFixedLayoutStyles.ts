import type { CSSProperties } from "vue";

import { APP_BAR_HEIGHT, LEFT_DRAWER_WIDTH, RIGHT_DRAWER_WIDTH } from "#shared/services/app/constants";
import { useLayoutStore } from "@/store/layout";

export const useFixedLayoutStyles = (bottomOffset: Ref<number | string>) => {
  const layoutStore = useLayoutStore();
  const { isDesktop, isLeftDrawerOpen, isRightDrawerOpen } = storeToRefs(layoutStore);
  const leftOffset = computed(() => (isLeftDrawerOpen.value ? 0 : -LEFT_DRAWER_WIDTH));
  const rightOffset = computed(() => (isRightDrawerOpen.value ? 0 : -RIGHT_DRAWER_WIDTH));
  // We only need to offset the middle if we are on desktop
  // as the drawers are floating on non-desktop screens
  const middleLeftOffset = computed(() => (isDesktop.value && isLeftDrawerOpen.value ? LEFT_DRAWER_WIDTH : 0));
  const middleRightOffset = computed(() => (isDesktop.value && isRightDrawerOpen.value ? RIGHT_DRAWER_WIDTH : 0));
  return {
    bottom: computed<CSSProperties>(() => ({
      bottom: "0px",
      left: `${middleLeftOffset.value}px`,
      width: `calc(100% - ${middleLeftOffset.value + middleRightOffset.value}px)`,
    })),
    left: computed<CSSProperties>(() => ({
      height: `calc(100% - ${APP_BAR_HEIGHT}px)`,
      left: `${leftOffset.value}px`,
      top: `${APP_BAR_HEIGHT}px`,
      width: `${LEFT_DRAWER_WIDTH}px`,
    })),
    middle: computed<CSSProperties>(() => ({
      "--v-layout-bottom": `${bottomOffset.value}px`,
      "--v-layout-left": `${middleLeftOffset.value}px`,
      "--v-layout-right": `${middleRightOffset.value}px`,
      "--v-layout-top": `${APP_BAR_HEIGHT}px !important`,
    })),
    right: computed<CSSProperties>(() => ({
      height: `calc(100% - ${APP_BAR_HEIGHT}px)`,
      right: `${rightOffset.value}px`,
      top: `${APP_BAR_HEIGHT}px`,
      width: `${RIGHT_DRAWER_WIDTH}px`,
    })),
  };
};
