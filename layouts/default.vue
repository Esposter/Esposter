<script setup lang="ts">
import { useLayoutStore } from "@/store/useLayoutStore";
import { storeToRefs } from "pinia";
import type { VMain } from "vuetify/components";

interface DefaultLayoutProps {
  mainAttrs?: InstanceType<typeof VMain>["$attrs"];
}

const props = defineProps<DefaultLayoutProps>();
const { mainAttrs } = $(toRefs(props));
const slots = useSlots();
const layoutStore = useLayoutStore();
const { leftDrawerOpen, rightDrawerOpen, leftDrawerOpenAuto, rightDrawerOpenAuto } = $(storeToRefs(layoutStore));
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

    <v-main :="{ ...mainAttrs }">
      <slot />
    </v-main>

    <v-footer v-if="slots.footer" app>
      <slot name="footer" />
    </v-footer>
  </div>
</template>

<style scoped lang="scss">
// Only show scrollbar for part of the drawer that actually has
// content greater than screen size rather than the entire drawer
:deep(.v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
}
</style>
