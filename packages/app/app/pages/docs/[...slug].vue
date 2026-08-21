<script setup lang="ts">
// One mount per page, so setup — and with it the 404 guard — runs for every docs page rather than only the first
definePageMeta({ key: (route) => route.path });

const { category, categorySections, page, sections, surround, tocLinks } = await useDocsPage();

useSeoMeta({ description: () => page.value?.description, title: () => page.value?.title });
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
      <DocsSurround :surround />
    </v-container>
    <AppScrollToTopButton />
  </NuxtLayout>
</template>
