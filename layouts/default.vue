<script setup lang="ts">
import { useLayoutStore } from "@/store/layout";
import type { CSSProperties } from "vue";
import { useDisplay } from "vuetify";

interface DefaultLayoutProps {
  mainStyle?: CSSProperties;
}

const props = defineProps<DefaultLayoutProps>();
const { mainStyle } = $(toRefs(props));
const { mobile } = $(useDisplay());
const router = useRouter();
const slots = useSlots();
const layoutStore = useLayoutStore();
let { leftDrawerOpen, rightDrawerOpen, leftDrawerOpenAuto, rightDrawerOpenAuto } = $(storeToRefs(layoutStore));

router.beforeEach(() => {
  // We need to reset layout structure on route change
  leftDrawerOpen = rightDrawerOpen = leftDrawerOpenAuto = rightDrawerOpenAuto = !mobile;
});
</script>

<template>
  <div display="contents">
    <!-- Ignore parent div here, it is only for nuxt -->
    <v-navigation-drawer
      v-if="slots.left"
      app
      :model-value="leftDrawerOpen"
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
      :model-value="rightDrawerOpen"
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

    <v-footer v-if="slots.footer" app>
      <slot name="footer" />
    </v-footer>
  </div>
</template>

<style scoped lang="scss">
// Only show scrollbar for part of the drawer that actually has
// content greater than screen size rather than the entire drawer.
// Make sure to apply attribute overflow-y="auto" for the container
// you want to show the scrollbar on in the drawer
.v-navigation-drawer__content {
  display: flex;
  flex-direction: column;
}
// Don't use transition for flexed backgrounds as that will reveal
// the underlying default background color, not the surface background color of the chat
.v-main {
  transition: none;
}
</style>
