<script setup lang="ts">
import type { URLLinkPreviewResponse } from "@esposter/db-schema";

const { description, images, siteName, title, url } = defineProps<URLLinkPreviewResponse>();
</script>

<!-- A page's own card for itself, embedded as Discord embeds one: where it is from, its title as the link, what it says
     about itself, and its picture -->
<template>
  <div p-3 flex flex-col gap-2 min-w-0 ui-frame>
    <span v-if="siteName" text-sm text-muted>{{ siteName }}</span>
    <NuxtLink :to="url" external target="_blank" text-info>{{ title }}</NuxtLink>
    <p v-if="description" text-sm>{{ description }}</p>
    <NuxtImg v-if="images[0]" w-full :src="images[0]" :alt="siteName ?? title" />
  </div>
</template>
