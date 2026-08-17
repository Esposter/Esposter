<script setup lang="ts">
import type { DefaultLinkPreviewResponse } from "@esposter/db-schema";

const { favicons, url } = defineProps<DefaultLinkPreviewResponse>();
</script>

<template>
  <StyledCard>
    <v-card-title font-bold>
      <NuxtLink :to="url" external target="_blank">
        {{ url }}
      </NuxtLink>
    </v-card-title>
    <v-card-actions v-if="favicons[0]">
      <NuxtImg w-full :src="favicons[0]" alt="" />
    </v-card-actions>
  </StyledCard>
</template>
