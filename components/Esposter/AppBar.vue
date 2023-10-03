<script setup lang="ts">
import { RoutePath } from "@/models/router/RoutePath";
import { SITE_NAME } from "@/services/esposter/constants";
</script>

<template>
  <v-app-bar density="comfortable" app :title="SITE_NAME">
    <template #prepend>
      <NuxtLink contents :to="RoutePath.Index">
        <EsposterLogo />
      </NuxtLink>
    </template>
    <template #append>
      <div flex gap-x-2>
        <EsposterMenuButton />
        <EsposterToggleThemeButton />
        <EsposterGithubButton />
        <EsposterMoreDropdownButton />
      </div>
    </template>
  </v-app-bar>
</template>
