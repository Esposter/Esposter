<script setup lang="ts">
import type { URLLinkPreviewResponse } from "@esposter/db";

const { description, images, siteName, title, url } = defineProps<URLLinkPreviewResponse>();
</script>

<template>
  <StyledCard>
    <v-card-title font-bold>
      <NuxtLink :to="url" external target="_blank">
        {{ title }}
      </NuxtLink>
    </v-card-title>
    <v-card-text v-if="description">
      {{ description }}
    </v-card-text>
    <v-img width="100%" :src="images[0]" :alt="siteName ?? title" cover />
  </StyledCard>
</template>
