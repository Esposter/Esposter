<script setup lang="ts">
import { useDisplay } from "vuetify";

const slots = useSlots();
const { mobile } = $(useDisplay());
// The internal variables will track if we want to actually show the drawers
const internalLeftDrawer = $ref(!mobile);
const internalRightDrawer = $ref(!mobile);
// We will only expose these variables as they are only affected by the screen resizing
// We want the decision of showing the outer components to be only dependent on that for better UI/UX
const leftDrawer = $ref(!mobile);
const rightDrawer = $ref(!mobile);
</script>

<template>
  <div display="contents">
    <!-- Ignore parent div here, it is only for nuxt -->
    <v-navigation-drawer
      v-if="slots.left"
      app
      :model-value="internalLeftDrawer"
      @update:model-value="
        (value) => {
          internalLeftDrawer = value;
          leftDrawer = value;
        }
      "
    >
      <slot name="left" />
    </v-navigation-drawer>

    <v-navigation-drawer
      v-if="slots.right"
      app
      location="right"
      :model-value="internalRightDrawer"
      @update:model-value="
        (value) => {
          internalRightDrawer = value;
          rightDrawer = value;
        }
      "
    >
      <slot name="right" />
    </v-navigation-drawer>

    <v-main>
      <slot
        :left-drawer="leftDrawer"
        :right-drawer="rightDrawer"
        :open-left-drawer="() => (internalLeftDrawer = true)"
        :open-right-drawer="() => (internalRightDrawer = true)"
      />
    </v-main>

    <v-footer v-if="slots.footer" app>
      <slot name="footer" />
    </v-footer>
  </div>
</template>

<style lang="scss">
.v-navigation-drawer__content {
  display: flex;
  flex-direction: column;
}
</style>
