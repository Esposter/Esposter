<script setup lang="ts">
import type { DefaultLinkPreviewResponse } from "@esposter/db-schema";

defineProps<DefaultLinkPreviewResponse>();
</script>

<!-- A link whose page says nothing about itself, embedded as Discord embeds one: the address, and its icon -->
<template>
  <div p-3 flex flex-col gap-2 min-w-0 ui-frame>
    <NuxtLink :to="url" target="_blank" external text-info truncate hover:underline>{{ url }}</NuxtLink>
    <NuxtImg v-if="favicons[0]" w-full :src="favicons[0]" alt="" />
  </div>
</template>
