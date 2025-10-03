<script setup lang="ts">
import type { CSSProperties } from "vue";
import type { VNavigationDrawer } from "vuetify/components";

import { useLayoutStore } from "@/store/layout";

interface DefaultProps {
  bottomOffset?: number;
  footerStyle?: CSSProperties;
  hideGlobalScrollbar?: true;
  leftNavigationDrawerProps?: VNavigationDrawer["$props"];
  mainStyle?: CSSProperties;
  rightNavigationDrawerProps?: VNavigationDrawer["$props"];
}

const {
  bottomOffset,
  footerStyle,
  hideGlobalScrollbar,
  leftNavigationDrawerProps,
  mainStyle,
  rightNavigationDrawerProps,
} = defineProps<DefaultProps>();
const slots = defineSlots<{
  default?: () => VNode;
  footer?: () => VNode;
  left?: () => VNode;
  right?: () => VNode;
}>();
const layoutStore = useLayoutStore();
const { isDesktop, isLeftDrawerOpen, isLeftDrawerOpenAuto, isRightDrawerOpen, isRightDrawerOpenAuto } =
  storeToRefs(layoutStore);
// Fix the layout structure so navigating does not cause a layout shift
const { bottom, left, middle, right } = useFixedLayoutStyles(bottomOffset);

onMounted(() => {
  isLeftDrawerOpen.value = isLeftDrawerOpenAuto.value = slots.left ? isDesktop.value : false;
  isRightDrawerOpen.value = isRightDrawerOpenAuto.value = slots.right ? isDesktop.value : false;
});
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
    <!-- Set max height here so we can hide global window scrollbar -->
    <v-main :style="{ ...middle, ...mainStyle, maxHeight: hideGlobalScrollbar ? '100dvh' : undefined }">
      <slot />
    </v-main>

    <v-footer v-if="slots.footer" :style="{ ...bottom, ...footerStyle }" app>
      <slot name="footer" />
    </v-footer>
  </div>
</template>

<style scoped lang="scss">
.v-main {
  padding-top: $app-bar-height;
}
// Only show scrollbar for part of the drawer that actually has
// content greater than screen size rather than the entire drawer.
// Make sure to apply attribute overflow-y-auto for the container
// that you want to show the scrollbar on in the drawer
:deep(.v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
}
</style>
