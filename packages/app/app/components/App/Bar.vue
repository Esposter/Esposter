<script setup lang="ts">
import { RoutePath } from "#shared/models/router/RoutePath";
import { SITE_NAME } from "#shared/services/app/constants";
</script>

<template>
  <v-app-bar pl-2 color="surface" density="comfortable">
    <template #prepend>
      <NuxtInvisibleLink :to="RoutePath.Index">
        <AppLogo />
      </NuxtInvisibleLink>
    </template>
    <v-app-bar-title pl-2>
      {{ SITE_NAME }}
    </v-app-bar-title>
    <template #append>
      <div flex gap-x-2>
        <AppMenuButton />
        <AppToggleThemeButton />
        <AppGithubButton />
        <AppMoreDropdownButton />
      </div>
    </template>
  </v-app-bar>
</template>
