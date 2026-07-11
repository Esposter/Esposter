<script setup lang="ts">
import { ContentCollection } from "#shared/models/content/ContentCollection";
import { getSectionCategory } from "@/services/docs/getSectionCategory";
import { getSortedNavigationItems } from "@/services/docs/getSortedNavigationItems";
import { AsyncDataKey } from "@/services/shared/AsyncDataKey";
import { RoutePath } from "@esposter/shared";

definePageMeta({ key: (route) => route.path });

const route = useRoute();
const path = route.path.endsWith("/") ? route.path.slice(0, -1) : route.path;
const [{ data: page }, { data: navigation }, { data: surround }] = await Promise.all([
  useAsyncData(AsyncDataKey.DocsPage(path), () => queryCollection(ContentCollection.Docs).path(path).first()),
  useAsyncData(AsyncDataKey.DocsNavigation, () => queryCollectionNavigation(ContentCollection.Docs)),
  useAsyncData(AsyncDataKey.DocsSurround(path), () =>
    queryCollectionItemSurroundings(ContentCollection.Docs, path, { fields: ["description"] }),
  ),
]);

if (!page.value) throw createError({ fatal: true, statusCode: 404, statusMessage: "Page Not Found" });

// Unwrap the single docs root group; drop the root index page @nuxt/content injects as its own child
const sections = computed(() =>
  getSortedNavigationItems(
    navigation.value?.find(({ path: itemPath }) => itemPath === RoutePath.Docs)?.children ?? navigation.value ?? [],
  ).filter(({ path: itemPath }) => itemPath !== RoutePath.Docs),
);
const section = computed(() =>
  sections.value.find(({ path: sectionPath }) => path === sectionPath || path.startsWith(`${sectionPath}/`)),
);
const category = computed(() => (section.value ? getSectionCategory(section.value.path) : undefined));
const categorySections = computed(() =>
  category.value
    ? sections.value.filter(({ path: sectionPath }) => getSectionCategory(sectionPath) === category.value)
    : [],
);
const tocLinks = computed(() => page.value?.body.toc?.links ?? []);

useSeoMeta({ description: page.value.description, title: page.value.title });
</script>

<template>
  <NuxtLayout :main-style="{ backgroundColor: 'rgb(var(--v-theme-surface))' }">
    <template #left>
      <DocsNavigation v-if="category" :sections="categorySections" />
      <DocsNavigationOverview v-else :sections />
    </template>
    <template v-if="tocLinks.length > 0" #right>
      <DocsTableOfContents :links="tocLinks" />
    </template>
    <DocsCategoryTabs :active-category="category" :sections />
    <v-container max-w-240>
      <DocsPageContent v-if="page" :page />
      <DocsSurround v-if="surround" :surround />
    </v-container>
    <AppScrollToTopButton />
  </NuxtLayout>
</template>
