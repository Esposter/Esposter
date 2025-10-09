<script setup lang="ts">
import type { DefaultLinkPreviewResponse } from "@esposter/db";

const { favicons, url } = defineProps<DefaultLinkPreviewResponse>();
</script>

<template>
  <StyledCard>
    <v-card-title font-bold>
      <NuxtLink :to="url" external target="_blank">
        {{ url }}
      </NuxtLink>
    </v-card-title>
    <v-card-actions>
      <v-img width="100%" :src="favicons[0]" cover />
    </v-card-actions>
  </StyledCard>
</template>
