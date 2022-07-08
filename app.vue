<script setup lang="ts">
import { FAVICON_32x32_PATH, INDEX_PATH } from "@/util/constants";
import NuxtTheme from "./components/NuxtTheme.vue";
</script>

<template>
  <v-app>
    <v-app-bar density="comfortable" app>
      <template #prepend>
        <NuxtLink :to="INDEX_PATH">
          <v-img width="32" height="26" :src="FAVICON_32x32_PATH" alt="Esposter" />
        </NuxtLink>
      </template>
      <v-app-bar-title p="x-2!">Esposter</v-app-bar-title>
      <template #append>
        <ToggleThemeButton />
        <EsposterDropdownButton />
      </template>
    </v-app-bar>

    <NuxtTheme>
      <NuxtSEO>
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </NuxtSEO>
    </NuxtTheme>
  </v-app>
</template>

<style lang="scss">
$background: #00dc80;

#nprogress {
  pointer-events: none;
}

#nprogress .bar {
  position: fixed;
  top: 56px;
  left: 0;
  width: 100%;
  height: 3px;
  background: $background;
  z-index: 9999;
}

/* Fancy blur effect */
#nprogress .peg {
  width: 100%;
  height: 100%;
  box-shadow: 0 0 5px $background;
}
</style>
