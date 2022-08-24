<script setup lang="ts">
import { useDisplay } from "vuetify/lib/framework.mjs";

interface DefaultLayoutProps {
  mainClass?: string;
  chatbot?: true;
}

const { mainClass, chatbot } = defineProps<DefaultLayoutProps>();
const { mobile } = useDisplay();
// The internal variables will track if we want to actually show the drawers
const internalLeftDrawer = ref(!mobile.value);
const internalRightDrawer = ref(!mobile.value);
// We will only expose these variables as they are only affected by the screen resizing
// We want the decision of showing the outer components to be only dependent on that for better UI/UX
const leftDrawer = ref(!mobile.value);
const rightDrawer = ref(!mobile.value);
</script>

<template>
  <div display="contents">
    <!-- Ignore parent div here, it is only for nuxt -->
    <v-navigation-drawer
      v-if="$slots.left"
      :model-value="internalLeftDrawer"
      @update:model-value="
        (value) => {
          internalLeftDrawer = value;
          leftDrawer = value;
        }
      "
      app
    >
      <slot name="left" />
    </v-navigation-drawer>

    <v-navigation-drawer
      v-if="$slots.right"
      :model-value="internalRightDrawer"
      @update:model-value="
        (value) => {
          internalRightDrawer = value;
          rightDrawer = value;
        }
      "
      app
      location="right"
    >
      <slot name="right" />
    </v-navigation-drawer>

    <v-main :class="mainClass">
      <slot
        :leftDrawer="leftDrawer"
        :rightDrawer="rightDrawer"
        :openLeftDrawer="() => (internalLeftDrawer = true)"
        :openRightDrawer="() => (internalRightDrawer = true)"
      />
    </v-main>

    <v-footer v-if="$slots.footer" app>
      <slot name="footer" />
    </v-footer>

    <EsposterChatBotBubble v-if="chatbot" />
  </div>
</template>

<style lang="scss">
.v-navigation-drawer__content {
  display: flex;
  flex-direction: column;
}
</style>
