<script setup lang="ts">
import { ContentCollection } from "#shared/models/content/ContentCollection";
import { RoutePath } from "@esposter/shared";

definePageMeta({ key: (route) => route.path });

const route = useRoute();
const path = route.path.endsWith("/") ? route.path.slice(0, -1) : route.path;
const [{ data: page }, { data: navigation }] = await Promise.all([
  useAsyncData(`docs-page-${path}`, () => queryCollection(ContentCollection.Docs).path(path).first()),
  useAsyncData("docs-navigation", () => queryCollectionNavigation(ContentCollection.Docs)),
]);

if (!page.value) throw createError({ fatal: true, statusCode: 404, statusMessage: "Page Not Found" });

// Unwrap the single docs root group; fall back to the full tree if the shape ever changes
const items = computed(
  () => navigation.value?.find(({ path }) => path === RoutePath.Docs)?.children ?? navigation.value ?? [],
);

useSeoMeta({ description: page.value.description, title: page.value.title });
</script>

<template>
  <NuxtLayout>
    <template #left>
      <v-list density="compact" nav overflow-y-auto>
        <DocsNavigationList :items />
      </v-list>
    </template>
    <v-container max-w-240>
      <ContentRenderer v-if="page" class="docs-content" :value="page" />
    </v-container>
  </NuxtLayout>
</template>

<style scoped>
.docs-content :deep(h1) {
  font-size: 2.25rem;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.docs-content :deep(h2) {
  border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-size: 1.5rem;
  margin-block: 2rem 0.75rem;
  padding-bottom: 0.25rem;
}

.docs-content :deep(h3) {
  font-size: 1.2rem;
  margin-block: 1.5rem 0.5rem;
}

.docs-content :deep(p) {
  margin-bottom: 0.75rem;
}

.docs-content :deep(ul),
.docs-content :deep(ol) {
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
}

.docs-content :deep(li) {
  margin-bottom: 0.25rem;
}

.docs-content :deep(a) {
  color: rgb(var(--v-theme-primary));
}

.docs-content :deep(:not(pre) > code) {
  background-color: rgba(var(--v-border-color), 0.12);
  border-radius: 4px;
  padding: 0.1em 0.35em;
}

.docs-content :deep(table) {
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-collapse: collapse;
  display: block;
  margin-bottom: 1rem;
  overflow-x: auto;
  width: fit-content;
}

.docs-content :deep(th),
.docs-content :deep(td) {
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  padding: 0.4rem 0.75rem;
  text-align: left;
}

.docs-content :deep(blockquote) {
  border-left: 4px solid rgb(var(--v-theme-primary));
  margin-bottom: 0.75rem;
  opacity: 0.85;
  padding-left: 1rem;
}
</style>
