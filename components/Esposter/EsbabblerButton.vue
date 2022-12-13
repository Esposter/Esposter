<script setup lang="ts">
import { MESSAGES_INDEX_PATH } from "@/util/constants.client";
</script>

<template>
  <v-tooltip location="bottom" text="Esbabbler">
    <template #activator="{ props }">
      <InvisibleNuxtLink :to="MESSAGES_INDEX_PATH">
        <v-avatar color="background">
          <v-btn icon="mdi-message-fast" color="transparent" :="props" />
        </v-avatar>
      </InvisibleNuxtLink>
    </template>
  </v-tooltip>
</template>
