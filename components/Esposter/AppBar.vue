<script setup lang="ts">
    </script>

<template>
  <v-app-bar density="comfortable" app :title="SITE_NAME">
    <template #prepend>
      <NuxtLink display="contents" :to="INDEX_PATH">
        <EsposterLogo />
      </NuxtLink>
    </template>
    <template #append>
      <div display="flex" gap-x="2">
        <EsposterCreateDropdownButton />
        <EsposterEsbabblerButton />
        <EsposterToggleThemeButton />
        <EsposterMoreDropdownButton />
      </div>
    </template>
  </v-app-bar>
</template>
