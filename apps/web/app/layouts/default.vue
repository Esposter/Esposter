<script setup lang="ts">
import type { Except } from "type-fest";
import type { CSSProperties } from "vue";
import type { VNavigationDrawer } from "vuetify/components";

import { LEFT_DRAWER_WIDTH, RIGHT_DRAWER_WIDTH } from "#shared/services/app/constants";
import { useLayoutStore } from "@/store/layout";
import { takeOne } from "@esposter/shared";

// `StyledNavigationDrawer` owns the open state, so a caller styles and positions the drawer through this bag
// But never binds its model — passing one back would put two answers on the same prop
type NavigationDrawerProps = Except<VNavigationDrawer["$props"], "modelValue" | "onUpdate:modelValue">;

interface Props {
  footerStyle?: CSSProperties;
  hideGlobalScrollbar?: true;
  leftNavigationDrawerProps?: NavigationDrawerProps;
  mainStyle?: CSSProperties;
  rightNavigationDrawerProps?: NavigationDrawerProps;
}

const slots = defineSlots<{
  default?: () => VNode;
  footer?: () => VNode;
  left?: () => VNode;
  right?: () => VNode;
}>();
const { footerStyle, hideGlobalScrollbar, leftNavigationDrawerProps, mainStyle, rightNavigationDrawerProps } =
  defineProps<Props>();
const layoutStore = useLayoutStore();
const { isDesktop, isLeftDrawerOpen, isLeftDrawerOpenAuto, isRightDrawerOpen, isRightDrawerOpenAuto } =
  storeToRefs(layoutStore);
const container = useTemplateRef("container");
const footer = useTemplateRef("footer");
const bottomOffset = ref(0);
// Fixed rather than flowed, so navigating between pages cannot shift the layout
const { bottom, left, middle, right } = useFixedLayoutStyles(
  bottomOffset,
  () => Number(leftNavigationDrawerProps?.width ?? LEFT_DRAWER_WIDTH),
  () => Number(rightNavigationDrawerProps?.width ?? RIGHT_DRAWER_WIDTH),
);
const mergedMainStyle = computed<CSSProperties>(() => ({
  ...middle.value,
  ...mainStyle,
  maxHeight: hideGlobalScrollbar ? "100dvh" : undefined,
}));
const mergedFooterStyle = computed<CSSProperties>(() => ({ ...bottom.value, ...footerStyle }));

useResizeObserver(footer, (entries) => {
  const entry = takeOne(entries);
  const { bottom: contentBottom } = entry.contentRect;
  bottomOffset.value = contentBottom;
});

onMounted(() => {
  isLeftDrawerOpen.value = isLeftDrawerOpenAuto.value = slots.left ? isDesktop.value : false;
  isRightDrawerOpen.value = isRightDrawerOpenAuto.value = slots.right ? isDesktop.value : false;
});

defineExpose({ container: computed<HTMLElement>(() => container.value?.$el) });
</script>

<template>
  <div contents>
    <StyledNavigationDrawer
      v-if="slots.left"
      :model-value="isLeftDrawerOpen"
      :style="left"
      :="leftNavigationDrawerProps"
      @update:model-value="isLeftDrawerOpen = isLeftDrawerOpenAuto = $event"
    >
      <slot name="left" />
    </StyledNavigationDrawer>

    <StyledNavigationDrawer
      v-if="slots.right"
      :model-value="isRightDrawerOpen"
      :style="right"
      location="right"
      :="rightNavigationDrawerProps"
      @update:model-value="isRightDrawerOpen = isRightDrawerOpenAuto = $event"
    >
      <slot name="right" />
    </StyledNavigationDrawer>
    <!-- The max height here is what keeps the global window scrollbar hidden -->
    <v-main ref="container" pt="[--app-bar-height]" :style="mergedMainStyle">
      <slot />
    </v-main>

    <v-footer v-if="slots.footer" ref="footer" :style="mergedFooterStyle" app>
      <slot name="footer" />
    </v-footer>
  </div>
</template>

<style scoped>
/* Only show scrollbar for part of the drawer that actually has
   content greater than screen size rather than the entire drawer.
   Make sure to apply attribute overflow-y-auto for the container
   that you want to show the scrollbar on in the drawer */
:deep(.v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
}
</style>
