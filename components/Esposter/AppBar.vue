<script setup lang="ts">
import { SITE_NAME } from "@/util/constants.client";
import { INDEX_PATH } from "@/util/constants.common";
</script>

<template>
  <v-app-bar density="comfortable" app :title="SITE_NAME">
    <template #prepend>
      <NuxtLink display="contents" :to="INDEX_PATH">
        <EsposterLogo />
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
