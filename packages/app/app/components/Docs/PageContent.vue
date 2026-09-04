<script setup lang="ts">
import type { PageCollectionItemBase } from "@nuxt/content";

interface Props {
  page: PageCollectionItemBase;
}

const { page } = defineProps<Props>();
</script>

<template>
  <ContentRenderer class="docs-content" :value="page" />
</template>

<style scoped lang="scss">
.docs-content {
  font-size: 1rem;
  line-height: 1.75;

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4) {
    scroll-margin-top: calc(var(--app-bar-height) + 4rem);
  }

  :deep(h1) {
    font-size: 2.25rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    line-height: 1.25;
    margin-bottom: 1rem;
  }

  :deep(h2) {
    border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.3;
    margin-block: 2.5rem 1rem;
    padding-bottom: 0.375rem;
  }

  :deep(h3) {
    font-size: 1.25rem;
    font-weight: 600;
    margin-block: 2rem 0.75rem;
  }

  :deep(h4) {
    font-size: 1rem;
    font-weight: 600;
    margin-block: 1.5rem 0.5rem;
  }

  :deep(a) {
    color: rgb(var(--v-theme-info));
    text-decoration: underline;
    text-underline-offset: 0.125rem;
  }
  // Heading anchor links keep the heading colour; the hash affordance appears on hover
  :deep(h1 a),
  :deep(h2 a),
  :deep(h3 a),
  :deep(h4 a) {
    color: inherit;
    text-decoration: none;
  }

  :deep(h2 a::after),
  :deep(h3 a::after),
  :deep(h4 a::after) {
    color: rgb(var(--v-theme-primary));
    content: " #";
    opacity: 0;
    transition: opacity var(--transition-duration);
  }

  :deep(h2:hover a::after),
  :deep(h3:hover a::after),
  :deep(h4:hover a::after) {
    opacity: 1;
  }

  :deep(p) {
    margin-bottom: 1rem;
  }

  :deep(strong) {
    font-weight: 600;
  }

  :deep(ul),
  :deep(ol) {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }

  :deep(li) {
    margin-bottom: 0.25rem;
  }

  :deep(li > ul),
  :deep(li > ol) {
    margin-block: 0.25rem 0;
  }

  :deep(:not(pre) > code) {
    background-color: rgba(var(--v-border-color), 0.12);
    border-radius: 0.25rem;
    font-size: 0.875em;
    padding: 0.125em 0.375em;
  }

  :deep(table) {
    border-collapse: collapse;
    display: block;
    margin-block: 1rem;
    max-width: 100%;
    overflow-x: auto;
    width: max-content;
  }

  :deep(th),
  :deep(td) {
    border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
    padding: 0.5rem 0.75rem;
    text-align: left;
    vertical-align: top;
  }

  :deep(th) {
    background-color: rgba(var(--v-border-color), 0.06);
  }

  :deep(blockquote) {
    border-left: 0.25rem solid rgb(var(--v-theme-primary));
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
    margin-bottom: 1rem;
    padding-left: 1rem;
  }

  :deep(hr) {
    border: none;
    border-top: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
    margin-block: 2rem;
  }

  :deep(img) {
    border-radius: 0.5rem;
    max-width: 100%;
  }
}
</style>
