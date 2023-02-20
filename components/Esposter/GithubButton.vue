<script setup lang="ts">
import { RoutePath } from "@/models/router";
</script>

<template>
  <v-tooltip location="bottom" text="Github">
    <template #activator="{ props }">
      <NuxtInvisibleLink :to="RoutePath.Github">
        <v-avatar color="background">
          <v-btn :="props">
            <VisualLogoGithub w="6" fill="currentColor" />
          </v-btn>
        </v-avatar>
      </NuxtInvisibleLink>
    </template>
  </v-tooltip>
</template>
