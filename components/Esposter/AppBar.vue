<script setup lang="ts">
import { FAVICON_32X32_PATH, INDEX_PATH, SITE_NAME } from "@/util/constants.client";
</script>

<template>
  <v-app-bar density="comfortable" app :title="SITE_NAME">
    <template #prepend>
      <NuxtLink :to="INDEX_PATH">
        <v-img width="32" height="26" :src="FAVICON_32X32_PATH" :alt="SITE_NAME" />
      </NuxtLink>
    </template>
    <template #append>
      <EsposterCreateDropdownButton />
      <div pl="2">
        <EsposterEsbabblerButton />
      </div>
      <div pl="2">
        <EsposterToggleThemeButton />
      </div>
      <div pl="2">
        <EsposterMoreDropdownButton />
      </div>
    </template>
  </v-app-bar>
</template>
