<script setup lang="ts">
import { FAVICON_32X32_PATH, INDEX_PATH } from "@/util/constants.client";
</script>

<template>
  <v-app-bar density="comfortable" app>
    <template #prepend>
      <NuxtLink :to="INDEX_PATH">
        <v-img width="32" height="26" :src="FAVICON_32X32_PATH" alt="Esposter" />
      </NuxtLink>
    </template>
    <v-app-bar-title>Esposter</v-app-bar-title>
    <template #append>
      <EsposterCreateDropdownButton />
      <EsposterToggleThemeButton m="x-2" />
      <EsposterMoreDropdownButton />
    </template>
  </v-app-bar>
</template>
