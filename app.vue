<script setup lang="ts">
const { vueBackground } = useColors();
</script>

<template>
  <v-app>
    <EsposterAppBar />
    <NuxtLoadingIndicator :height="2" :color="vueBackground" />
    <NuxtTheme>
      <NuxtSEO>
        <NuxtPage />
      </NuxtSEO>
    </NuxtTheme>
  </v-app>
</template>

<style lang="scss">
// Only show scrollbar when content actually exceeds screen height
html {
  overflow-y: auto;
}
</style>

<style scoped lang="scss">
.nuxt-loading-indicator {
  top: 56px !important;
  box-shadow: 0 0 5px $vueBackgroundColor;
  // Put progress bar just above appbar which has z index of 1000
  // but below menus which have z index of 2000
  z-index: 1500 !important;
}
</style>
