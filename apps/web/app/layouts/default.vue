<script setup lang="ts">
import type { CSSProperties } from "vue";

import { LEFT_DRAWER_WIDTH, RIGHT_DRAWER_WIDTH } from "#shared/services/app/constants";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { useLayoutStore } from "@/store/layout";
import { takeOne } from "@esposter/shared";

interface Props {
  footerStyle?: CSSProperties;
  hideGlobalScrollbar?: true;
  leftDrawerWidth?: number;
  // What the left and right drawers are, the title a narrow screen's sheet shows them under
  leftTitle?: string;
  mainStyle?: CSSProperties;
  rightDrawerWidth?: number;
  rightTitle?: string;
}

const slots = defineSlots<{
  default?: () => VNode;
  footer?: () => VNode;
  left?: () => VNode;
  right?: () => VNode;
}>();
const {
  footerStyle,
  hideGlobalScrollbar,
  leftDrawerWidth = LEFT_DRAWER_WIDTH,
  leftTitle = "Navigation",
  mainStyle,
  rightDrawerWidth = RIGHT_DRAWER_WIDTH,
  rightTitle = "Details",
} = defineProps<Props>();
const { currentRoute } = useRouter();
const layoutStore = useLayoutStore();
const { isDesktop, isFooterFocused, isLeftDrawerOpen, isLeftDrawerOpenAuto, isRightDrawerOpen, isRightDrawerOpenAuto } =
  storeToRefs(layoutStore);
const container = useTemplateRef("container");
const footer = useTemplateRef("footer");
const bottomOffset = ref(0);
const { focused: isFooterFocusedWithin } = useFocusWithin(footer);
// Fixed rather than flowed, so navigating between pages cannot shift the layout
const { bottom, left, middle, right } = useFixedLayoutStyles(
  bottomOffset,
  () => leftDrawerWidth,
  () => rightDrawerWidth,
);
const mergedMainStyle = computed<CSSProperties>(() => ({
  ...middle.value,
  ...mainStyle,
  maxHeight: hideGlobalScrollbar ? "100dvh" : undefined,
}));
const mergedFooterStyle = computed<CSSProperties>(() => ({ ...bottom.value, ...footerStyle }));

useResizeObserver(footer, (entries) => {
  const entry = takeOne(entries);
  bottomOffset.value = entry.contentRect.bottom;
});

watch(isFooterFocusedWithin, (newIsFooterFocusedWithin) => {
  isFooterFocused.value = newIsFooterFocusedWithin;
});
// A narrow screen's drawer is a sheet over the page, and a page picked from it is what it was opened for
watch(
  () => currentRoute.value.fullPath,
  () => {
    if (isDesktop.value) return;
    isLeftDrawerOpen.value = isRightDrawerOpen.value = false;
  },
);
// Leaving a page while its composer has focus takes no blur with it, and the dock must not stay hidden on the next
onUnmounted(() => {
  isFooterFocused.value = false;
});

onMounted(() => {
  // A wide screen docks every drawer the page has, open, and a narrow one keeps them closed behind their buttons
  watchImmediate(isDesktop, (newIsDesktop) => {
    isLeftDrawerOpen.value = isLeftDrawerOpenAuto.value = slots.left ? newIsDesktop : false;
    isRightDrawerOpen.value = isRightDrawerOpenAuto.value = slots.right ? newIsDesktop : false;
  });
});

defineExpose({ container: computed(() => container.value ?? undefined) });
</script>

<template>
  <div contents>
    <template v-if="slots.left">
      <aside
        v-if="isDesktop"
        class="drawer"
        :style="left"
        :inert="!isLeftDrawerOpen"
        flex
        flex-col
        fixed
        z-1004
        ui-frame
      >
        <slot name="left" />
      </aside>
      <UiDialog v-else v-model="isLeftDrawerOpen" :placement="UiDialogPlacement.Sheet" :title="leftTitle">
        <div flex flex-1 flex-col min-h-0>
          <slot name="left" />
        </div>
      </UiDialog>
    </template>
    <template v-if="slots.right">
      <aside
        v-if="isDesktop"
        class="drawer"
        :style="right"
        :inert="!isRightDrawerOpen"
        flex
        flex-col
        fixed
        z-1004
        ui-frame
      >
        <slot name="right" />
      </aside>
      <UiDialog v-else v-model="isRightDrawerOpen" :placement="UiDialogPlacement.Sheet" :title="rightTitle">
        <div flex flex-1 flex-col min-h-0>
          <slot name="right" />
        </div>
      </UiDialog>
    </template>
    <!-- The max height here is what keeps the global window scrollbar hidden -->
    <main ref="container" :style="mergedMainStyle" flex-1>
      <slot />
    </main>
    <footer
      v-if="slots.footer"
      ref="footer"
      :style="mergedFooterStyle"
      px-4
      py-2
      bg-panel
      flex
      items-center
      fixed
      z-1004
    >
      <slot name="footer" />
    </footer>
  </div>
</template>

<style scoped>
/* A docked drawer slides out past its edge as it closes, and the page beside it takes the room */
.drawer {
  transition:
    left var(--ui-motion-medium),
    right var(--ui-motion-medium);
}

main {
  transition: padding var(--ui-motion-medium);
}
</style>
