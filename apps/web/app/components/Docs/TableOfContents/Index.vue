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
  <nav p-4 of-y-auto aria-label="On this page" ui-body>
    <p text-muted mb-3 uppercase>On this page</p>
    <ul m-0 p-0 list-none relative ui-guide>
      <StyledSlideIndicator :active-keys="visibleIds" />
      <DocsTableOfContentsItem v-for="link of links" :key="link.id" :depth="0" :link :visible-ids />
    </ul>
  </nav>
</template>
