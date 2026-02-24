<script setup lang="ts">
const { "primary-lighten-1": primaryLighten1 } = useColors();
</script>

<template>
  <NuxtLoadingIndicator class="loading-indicator" :height="2" :color="primaryLighten1?.toString()" />
</template>

<style scoped lang="scss">
.loading-indicator {
  top: $app-bar-height !important;
  box-shadow: 0 0 5px v-bind(primaryLighten1);
  // Put loading indicator just above appbar which has z index of 1000
  // but below menus which have z index of 2000
  z-index: 1500 !important;
}
</style>
