<script setup lang="ts">
import { SITE_NAME } from "@/services/esposter/constants";
import { RoutePath } from "@/shared/models/router/RoutePath";
</script>

<template>
  <v-app-bar pl-2 color="surface" density="comfortable">
    <template #prepend>
      <NuxtLink contents :to="RoutePath.Index">
        <EsposterLogo />
      </NuxtLink>
    </template>
    <v-app-bar-title pl-2>
      {{ SITE_NAME }}
    </v-app-bar-title>
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
