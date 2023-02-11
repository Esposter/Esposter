<script setup lang="ts">
import { RoutePath } from "@/models/router";
</script>

<template>
  <v-tooltip location="bottom" text="Esbabbler">
    <template #activator="{ props }">
      <NuxtInvisibleLink :to="RoutePath.MessagesIndex">
        <v-avatar color="background">
          <v-btn icon="mdi-message-fast" :="props" />
        </v-avatar>
      </NuxtInvisibleLink>
    </template>
  </v-tooltip>
</template>
