<script setup lang="ts">
import { FAVICON_32x32_PATH, INDEX_PATH } from "@/util/constants";
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

    <v-navigation-drawer v-if="$slots.left" permanent app>
      <slot name="left" />
    </v-navigation-drawer>

    <v-navigation-drawer v-if="$slots.right" location="right" permanent app>
      <slot name="right" />
    </v-navigation-drawer>

    <v-main>
      <slot />
    </v-main>

    <v-footer v-if="$slots.footer" app>
      <slot name="footer" />
    </v-footer>
  </v-app>
</template>
