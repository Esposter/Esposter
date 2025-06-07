<script setup lang="ts">
import type { DefaultLinkPreviewResponse } from "#shared/models/esbabbler/linkPreview/DefaultLinkPreviewResponse";

const { favicons, url } = defineProps<DefaultLinkPreviewResponse>();
</script>

<template>
  <StyledCard>
    <v-img height="12rem" :src="favicons[0]" cover eager />
    <v-card-title font-bold>
      <NuxtLink :to="url" external target="_blank">
        {{ url }}
      </NuxtLink>
    </v-card-title>
    <v-card-actions>
      <v-img :src="favicons[0]" size-full />
    </v-card-actions>
  </StyledCard>
</template>
