<script setup lang="ts">
import type { TocLink } from "@nuxt/content";

interface TableOfContentsProps {
  links: TocLink[];
}

const { links } = defineProps<TableOfContentsProps>();
const activeId = useActiveTocLinkId(() => links);
</script>

<template>
  <nav p-4 overflow-y-auto aria-label="On this page">
    <p font-medium mb-2 op-medium-emphasis text-body-small>On this page</p>
    <ul m-0 p-0 list-none>
      <DocsTableOfContentsItem v-for="link of links" :key="link.id" :active-id :link />
    </ul>
  </nav>
</template>
