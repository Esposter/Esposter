<script setup lang="ts">
import type { TocLink } from "@nuxt/content";

import { getTocLinkIds } from "@/services/docs/getTocLinkIds";

interface Props {
  links: TocLink[];
}

const { links } = defineProps<Props>();
const visibleIds = useVisibleSectionIds(() => getTocLinkIds(links));
</script>

<template>
  <nav p-4 overflow-y-auto aria-label="On this page">
    <p text="[0.8125rem]" tracking-wide font-bold mb-3 uppercase op-medium-emphasis>On this page</p>
    <ul class="table-of-contents" m-0 p-0 list-none relative>
      <StyledSlideIndicator :active-keys="visibleIds" />
      <DocsTableOfContentsItem v-for="link of links" :key="link.id" :depth="0" :link :visible-ids />
    </ul>
  </nav>
</template>

<style scoped>
.table-of-contents {
  border-left: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
