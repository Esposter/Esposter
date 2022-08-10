<script setup lang="ts">
import { FAVICON_32x32_PATH, INDEX_PATH } from "@/util/constants";
</script>

<template>
  <v-app-bar density="comfortable" app>
    <template #prepend>
      <NuxtLink :to="INDEX_PATH">
        <v-img width="32" height="26" :src="FAVICON_32x32_PATH" alt="Esposter" />
      </NuxtLink>
    </template>
    <v-app-bar-title>Esposter</v-app-bar-title>
    <template #append>
      <EsposterToggleThemeButton m="r-2" />
      <EsposterDropdownButton />
    </template>
  </v-app-bar>
</template>
