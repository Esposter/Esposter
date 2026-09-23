<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";

interface Props {
  surround: [ContentNavigationItem | undefined, ContentNavigationItem | undefined];
}

const { surround } = defineProps<Props>();
const previous = computed(() => surround[0]);
const next = computed(() => surround[1]);
</script>

<template>
  <nav v-if="previous || next" aria-label="Previous and next pages" mt-12 gap-4 grid cols-1 md:cols-2>
    <DocsSurroundLink v-if="previous" :item="previous" />
    <div v-else />
    <DocsSurroundLink v-if="next" is-next :item="next" />
  </nav>
</template>
