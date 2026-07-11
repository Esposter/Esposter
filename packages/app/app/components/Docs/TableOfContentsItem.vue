<script setup lang="ts">
import type { TocLink } from "@nuxt/content";

interface TableOfContentsItemProps {
  depth: number;
  link: TocLink;
  visibleIds: string[];
}

const { depth, link, visibleIds } = defineProps<TableOfContentsItemProps>();
const isActive = computed(() => visibleIds.includes(link.id));
// Window is not reachable from template expressions, so the handler lives in script
const onClick = () => {
  window.document.getElementById(link.id)?.scrollIntoView({ behavior: "smooth" });
  window.history.replaceState(window.history.state, "", `#${link.id}`);
};
</script>

<template>
  <li>
    <a
      block
      py-1.5
      class="text-[0.9375rem]"
      no-underline
      transition-colors
      duration="[--transition-duration]"
      :class="isActive ? 'text-primary font-medium' : 'text-inherit op-medium-emphasis hover:op-high-emphasis'"
      :data-slide-indicator-key="link.id"
      :href="`#${link.id}`"
      :style="{ paddingLeft: `${0.75 + depth * 0.75}rem` }"
      @click.prevent="onClick()"
    >
      {{ link.text }}
    </a>
    <ul v-if="link.children" m-0 list-none p-0>
      <DocsTableOfContentsItem
        v-for="child of link.children"
        :key="child.id"
        :depth="depth + 1"
        :link="child"
        :visible-ids="visibleIds"
      />
    </ul>
  </li>
</template>
