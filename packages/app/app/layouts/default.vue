<script setup lang="ts">
import type { CSSProperties } from "vue";
import type { VNavigationDrawer } from "vuetify/components";

import { useLayoutStore } from "@/store/layout";

interface DefaultProps {
  footerStyle?: CSSProperties;
  leftNavigationDrawerProps?: VNavigationDrawer["$props"];
  mainStyle?: CSSProperties;
  rightNavigationDrawerProps?: VNavigationDrawer["$props"];
}

const { footerStyle, leftNavigationDrawerProps, mainStyle, rightNavigationDrawerProps } = defineProps<DefaultProps>();
const slots = defineSlots<{
  default?: (props: Record<string, never>) => unknown;
  footer?: (props: Record<string, never>) => unknown;
  left?: (props: Record<string, never>) => unknown;
  right?: (props: Record<string, never>) => unknown;
}>();
const { mobile } = useDisplay();
const router = useRouter();
const layoutStore = useLayoutStore();
const { leftDrawerOpen, leftDrawerOpenAuto, rightDrawerOpen, rightDrawerOpenAuto } = storeToRefs(layoutStore);

router.beforeEach(() => {
  // We need to reset layout structure on route change
  leftDrawerOpen.value = rightDrawerOpen.value = leftDrawerOpenAuto.value = rightDrawerOpenAuto.value = !mobile.value;
});
</script>

<template>
  <!-- Ignore parent div here, it is only for nuxt -->
  <div contents>
    <v-navigation-drawer
      v-if="slots.left"
      app
      :model-value="leftNavigationDrawerProps?.permanent ?? leftDrawerOpen"
      :="leftNavigationDrawerProps"
      @update:model-value="
        (value) => {
          leftDrawerOpen = value;
          leftDrawerOpenAuto = value;
        }
      "
    >
      <slot name="left" />
    </v-navigation-drawer>

    <v-navigation-drawer
      v-if="slots.right"
      app
      location="right"
      :model-value="rightNavigationDrawerProps?.permanent ?? rightDrawerOpen"
      :="rightNavigationDrawerProps"
      @update:model-value="
        (value) => {
          rightDrawerOpen = value;
          rightDrawerOpenAuto = value;
        }
      "
    >
      <slot name="right" />
    </v-navigation-drawer>

    <v-main :style="mainStyle">
      <slot />
    </v-main>

    <v-footer v-if="slots.footer" :style="footerStyle" app>
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
.v-navigation-drawer__content {
  display: flex;
  flex-direction: column;
}
</style>
