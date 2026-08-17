<script setup lang="ts">
import type { URLLinkPreviewResponse } from "@esposter/db-schema";

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
    <NuxtImg v-if="images[0]" w-full :src="images[0]" :alt="siteName ?? title" />
  </StyledCard>
</template>
