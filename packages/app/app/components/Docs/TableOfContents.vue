<script setup lang="ts">
import type { TocLink } from "@nuxt/content";

interface TableOfContentsProps {
  links: TocLink[];
}

const { links } = defineProps<TableOfContentsProps>();
const visibleIds = useVisibleTocLinkIds(() => links);
</script>

<template>
  <nav overflow-y-auto p-4 aria-label="On this page">
    <p class="text-[0.8125rem]" mb-3 font-bold uppercase tracking-wide op-medium-emphasis>On this page</p>
    <ul class="table-of-contents" relative m-0 list-none p-0>
      <StyledSlideIndicator :active-keys="visibleIds" />
      <DocsTableOfContentsItem v-for="link of links" :key="link.id" :depth="0" :link :visible-ids="visibleIds" />
    </ul>
  </nav>
</template>

<style scoped>
.table-of-contents {
  border-left: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
