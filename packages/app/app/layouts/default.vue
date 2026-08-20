<script setup lang="ts">
import type { CSSProperties } from "vue";
import type { VNavigationDrawer } from "vuetify/components";

import { LEFT_DRAWER_WIDTH, RIGHT_DRAWER_WIDTH } from "#shared/services/app/constants";
import { useLayoutStore } from "@/store/layout";
import { takeOne } from "@esposter/shared";

interface DefaultProps {
  footerStyle?: CSSProperties;
  hideGlobalScrollbar?: true;
  leftNavigationDrawerProps?: VNavigationDrawer["$props"];
  mainStyle?: CSSProperties;
  rightNavigationDrawerProps?: VNavigationDrawer["$props"];
}

const slots = defineSlots<{
  default?: () => VNode;
  footer?: () => VNode;
  left?: () => VNode;
  right?: () => VNode;
}>();
const { footerStyle, hideGlobalScrollbar, leftNavigationDrawerProps, mainStyle, rightNavigationDrawerProps } =
  defineProps<DefaultProps>();
const layoutStore = useLayoutStore();
const { isDesktop, isLeftDrawerOpen, isLeftDrawerOpenAuto, isRightDrawerOpen, isRightDrawerOpenAuto } =
  storeToRefs(layoutStore);
const container = useTemplateRef("container");
const footer = useTemplateRef("footer");
const bottomOffset = ref(0);
// Fix the layout structure so navigating does not cause a layout shift
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
    <v-navigation-drawer
      v-if="slots.left"
      :style="left"
      :model-value="leftNavigationDrawerProps?.permanent ?? isLeftDrawerOpen"
      :="leftNavigationDrawerProps"
      @update:model-value="
        (value) => {
          isLeftDrawerOpen = value;
          isLeftDrawerOpenAuto = value;
        }
      "
    >
      <slot name="left" />
    </v-navigation-drawer>

    <v-navigation-drawer
      v-if="slots.right"
      :style="right"
      :model-value="rightNavigationDrawerProps?.permanent ?? isRightDrawerOpen"
      location="right"
      :="rightNavigationDrawerProps"
      @update:model-value="
        (value) => {
          isRightDrawerOpen = value;
          isRightDrawerOpenAuto = value;
        }
      "
    >
      <slot name="right" />
    </v-navigation-drawer>
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
