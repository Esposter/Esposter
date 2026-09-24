import type { CSSProperties } from "vue";

import { LEFT_DRAWER_WIDTH, RIGHT_DRAWER_WIDTH } from "#shared/services/app/constants";
import { DOCK_INSET_BLOCK_END_CSS_VALUE, DOCK_INSET_INLINE_START_CSS_VALUE } from "@/services/app/constants";
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
  // Every region starts where the dock ends: past the rail on a wide screen, above the bar on a narrow one
  const drawerHeight = `calc(100% - ${DOCK_INSET_BLOCK_END_CSS_VALUE})`;
  return {
    bottom: computed<CSSProperties>(() => ({
      bottom: DOCK_INSET_BLOCK_END_CSS_VALUE,
      left: `calc(${DOCK_INSET_INLINE_START_CSS_VALUE} + ${middleLeftOffset.value}px)`,
      width: `calc(100% - ${DOCK_INSET_INLINE_START_CSS_VALUE} - ${middleLeftOffset.value + middleRightOffset.value}px)`,
    })),
    left: computed<CSSProperties>(() => ({
      height: drawerHeight,
      left: `calc(${DOCK_INSET_INLINE_START_CSS_VALUE} + ${isLeftDrawerOpen.value ? 0 : -toValue(leftWidth)}px)`,
      top: 0,
      width: `${toValue(leftWidth)}px`,
    })),
    middle: computed<CSSProperties>(() => ({
      "--v-layout-bottom": `calc(${DOCK_INSET_BLOCK_END_CSS_VALUE} + ${bottomOffset.value}px)`,
      "--v-layout-left": `calc(${DOCK_INSET_INLINE_START_CSS_VALUE} + ${middleLeftOffset.value}px)`,
      "--v-layout-right": `${middleRightOffset.value}px`,
      "--v-layout-top": "0px",
    })),
    right: computed<CSSProperties>(() => ({
      height: drawerHeight,
      right: `${isRightDrawerOpen.value ? 0 : -toValue(rightWidth)}px`,
      top: 0,
      width: `${toValue(rightWidth)}px`,
    })),
  };
};
