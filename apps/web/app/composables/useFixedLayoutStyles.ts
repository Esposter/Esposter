import type { CSSProperties } from "vue";

import { LEFT_DRAWER_WIDTH, RIGHT_DRAWER_WIDTH } from "#shared/services/app/constants";
import { APP_BAR_CSS_VALUE } from "@/services/app/constants";
import { useLayoutStore } from "@/store/layout";

export const useFixedLayoutStyles = (
  bottomOffset: Ref<number | string>,
  leftWidth: MaybeRefOrGetter<number> = LEFT_DRAWER_WIDTH,
  rightWidth: MaybeRefOrGetter<number> = RIGHT_DRAWER_WIDTH,
) => {
  const layoutStore = useLayoutStore();
  const { isDesktop, isLeftDrawerOpen, isRightDrawerOpen } = storeToRefs(layoutStore);
  // The drawers float on non-desktop screens, so only a desktop layout owes the middle an offset
  const middleLeftOffset = computed(() => (isDesktop.value && isLeftDrawerOpen.value ? toValue(leftWidth) : 0));
  const middleRightOffset = computed(() => (isDesktop.value && isRightDrawerOpen.value ? toValue(rightWidth) : 0));
  return {
    bottom: computed<CSSProperties>(() => ({
      bottom: "0",
      left: `${middleLeftOffset.value}px`,
      width: `calc(100% - ${middleLeftOffset.value + middleRightOffset.value}px)`,
    })),
    left: computed<CSSProperties>(() => ({
      height: `calc(100% - ${APP_BAR_CSS_VALUE})`,
      left: `${isLeftDrawerOpen.value ? 0 : -toValue(leftWidth)}px`,
      top: APP_BAR_CSS_VALUE,
      width: `${toValue(leftWidth)}px`,
    })),
    middle: computed<CSSProperties>(() => ({
      "--v-layout-bottom": `${bottomOffset.value}px`,
      "--v-layout-left": `${middleLeftOffset.value}px`,
      "--v-layout-right": `${middleRightOffset.value}px`,
      "--v-layout-top": APP_BAR_CSS_VALUE,
    })),
    right: computed<CSSProperties>(() => ({
      height: `calc(100% - ${APP_BAR_CSS_VALUE})`,
      right: `${isRightDrawerOpen.value ? 0 : -toValue(rightWidth)}px`,
      top: APP_BAR_CSS_VALUE,
      width: `${toValue(rightWidth)}px`,
    })),
  };
};
