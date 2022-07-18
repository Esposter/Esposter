<script setup lang="ts">
interface DefaultLayoutProps {
  mainClass?: string;
}

const { mainClass } = defineProps<DefaultLayoutProps>();
</script>

<template>
  <div display="contents">
    <!-- Ignore parent div here, it is only for nuxt -->
    <v-navigation-drawer v-if="$slots.left" permanent app>
      <slot name="left" />
    </v-navigation-drawer>

    <v-navigation-drawer v-if="$slots.right" permanent app location="right">
      <slot name="right" />
    </v-navigation-drawer>

    <v-main :class="mainClass">
      <slot />
    </v-main>

    <v-footer v-if="$slots.footer" app>
      <slot name="footer" />
    </v-footer>
  </div>
</template>
