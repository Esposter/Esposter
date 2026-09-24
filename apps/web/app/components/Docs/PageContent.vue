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

<!-- The page is markdown rendered to bare elements, so they take the library's type here rather than a class each -->
<style scoped lang="scss">
.docs-content {
  line-height: 1.5;

  // A readable measure for running text; tables, code and diagrams keep the column's whole width
  :deep(:is(p, ul, ol, blockquote)) {
    max-width: 70ch;
  }

  :deep(:is(h1, h2, h3, h4)) {
    color: var(--ui-accent);
    font-family: var(--ui-font-heading);
    font-weight: normal;
    line-height: 1.2;
    scroll-margin-top: calc(var(--ui-step) * 16);
  }

  :deep(h1) {
    font-size: var(--ui-text-title);
    margin-bottom: 1rem;
  }

  :deep(h2) {
    box-shadow: 0 var(--ui-step) 0 0 var(--ui-border);
    font-size: var(--ui-text-heading);
    margin-block: 2.5rem 1rem;
    padding-bottom: var(--ui-step);
  }

  :deep(h3) {
    font-size: var(--ui-text-heading);
    margin-block: 2rem 0.75rem;
  }

  :deep(h4) {
    font-size: var(--ui-text-body);
    margin-block: 1.5rem 0.5rem;
  }

  :deep(a) {
    color: var(--ui-info);
    text-decoration: none;
  }

  :deep(a:hover) {
    text-decoration: underline;
  }
  // Heading anchor links keep the heading colour; the hash affordance appears on hover
  :deep(:is(h1, h2, h3, h4) a) {
    color: inherit;
    text-decoration: none;
  }

  :deep(:is(h2, h3, h4) a::after) {
    content: " #";
    opacity: 0;
    transition: opacity var(--transition-duration);
  }

  :deep(:is(h2, h3, h4):hover a::after) {
    opacity: 1;
  }

  :deep(p) {
    margin-bottom: 1rem;
  }

  :deep(strong) {
    color: var(--ui-accent);
    font-weight: inherit;
  }

  :deep(:is(ul, ol)) {
    margin-bottom: 1rem;
    padding-inline-start: 1.5rem;
  }

  :deep(ul) {
    list-style-type: square;
  }

  :deep(ol) {
    list-style-type: decimal;
  }

  :deep(li) {
    margin-bottom: 0.25rem;
  }

  :deep(li > :is(ul, ol)) {
    margin-block: 0.25rem 0;
  }

  :deep(:not(pre) > code) {
    background-color: var(--ui-panel);
    font-family: var(--ui-font-mono);
    padding-inline: var(--ui-step);
  }

  :deep(table) {
    border-collapse: collapse;
    display: block;
    margin-block: 1rem;
    max-width: 100%;
    overflow-x: auto;
    width: max-content;
  }

  :deep(:is(th, td)) {
    border: var(--ui-step) solid var(--ui-border);
    padding: 0.5rem 0.75rem;
    text-align: left;
    vertical-align: top;
  }

  :deep(th) {
    background-color: var(--ui-panel);
    color: var(--ui-accent);
    font-weight: normal;
  }

  :deep(blockquote) {
    border-inline-start: var(--ui-step) solid var(--ui-accent);
    color: var(--ui-muted);
    margin-bottom: 1rem;
    padding-inline-start: 1rem;
  }

  :deep(hr) {
    border: none;
    border-top: var(--ui-step) solid var(--ui-border);
    margin-block: 2rem;
  }

  :deep(img) {
    max-width: 100%;
  }
}
</style>
