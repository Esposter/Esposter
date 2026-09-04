<script setup lang="ts">
import type { TocLink } from "@nuxt/content";

interface Props {
  depth: number;
  link: TocLink;
  visibleIds: string[];
}

const { depth, link, visibleIds } = defineProps<Props>();
const isActive = computed(() => visibleIds.includes(link.id));
</script>

<template>
  <li>
    <NuxtInvisibleLink
      class="text-[0.9375rem]"
      duration="[--transition-duration]"
      :class="isActive ? 'text-primary font-medium' : 'text-inherit op-medium-emphasis hover:op-high-emphasis'"
      :data-slide-indicator-key="link.id"
      :to="{ hash: `#${link.id}` }"
      :style="{ paddingLeft: `${0.75 + depth * 0.75}rem` }"
      replace
      py-1.5
      no-underline
      block
      transition-colors
    >
      {{ link.text }}
    </NuxtInvisibleLink>
    <ul v-if="link.children" m-0 p-0 list-none>
      <DocsTableOfContentsItem
        v-for="child of link.children"
        :key="child.id"
        :depth="depth + 1"
        :link="child"
        :visible-ids
      />
    </ul>
  </li>
</template>
