<script setup lang="ts">
import { RoutePath } from "@/models/router/RoutePath";
</script>

<template>
  <v-tooltip text="Calendar">
    <template #activator="{ props }">
      <NuxtInvisibleLink :to="RoutePath.Calendar">
        <v-btn variant="elevated" :flat="false" :="props">
          <v-icon icon="mdi-calendar" />
        </v-btn>
      </NuxtInvisibleLink>
    </template>
  </v-tooltip>
</template>
