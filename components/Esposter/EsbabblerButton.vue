<script setup lang="ts">
import { RoutePath } from "@/models/router";
</script>

<template>
  <v-tooltip location="bottom" text="Esbabbler">
    <template #activator="{ props }">
      <InvisibleNuxtLink :to="RoutePath.MessagesIndex">
        <v-avatar color="background">
          <v-btn icon="mdi-message-fast" :="props" />
        </v-avatar>
      </InvisibleNuxtLink>
    </template>
  </v-tooltip>
</template>
