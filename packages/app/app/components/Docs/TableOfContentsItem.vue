<script setup lang="ts">
import type { TocLink } from "@nuxt/content";

interface TableOfContentsItemProps {
  activeId: string;
  link: TocLink;
}

const { activeId, link } = defineProps<TableOfContentsItemProps>();
// window is not reachable from template expressions, so the handler lives in script
const onClick = () => {
  window.document.getElementById(link.id)?.scrollIntoView({ behavior: "smooth" });
  window.history.replaceState(window.history.state, "", `#${link.id}`);
};
</script>

<template>
  <li>
    <a
      py-1
      no-underline
      block
      transition-colors
      duration-[--transition-duration]
      text-body-small
      :class="link.id === activeId ? 'text-primary' : 'text-inherit op-medium-emphasis hover:op-high-emphasis'"
      :href="`#${link.id}`"
      @click.prevent="onClick()"
    >
      {{ link.text }}
    </a>
    <ul v-if="link.children" m-0 pl-3 list-none>
      <DocsTableOfContentsItem v-for="child of link.children" :key="child.id" :active-id :link="child" />
    </ul>
  </li>
</template>
