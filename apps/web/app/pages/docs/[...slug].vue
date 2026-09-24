<script setup lang="ts">
// One mount per page, so setup — and with it the 404 guard — runs for every docs page rather than only the first
definePageMeta({ key: (route) => route.path });
// Before the await, which leaves the page's setup context behind
useDocsCommandScope();

const { category, categorySections, page, sections, surround, tocLinks } = await useDocsPage();

useSeoMeta({ description: () => page.value?.description, title: () => page.value?.title });
</script>

<template>
  <NuxtLayout>
    <template #left>
      <DocsSidebar :category :category-sections :sections />
    </template>
    <template v-if="tocLinks.length > 0" #right>
      <DocsTableOfContents :links="tocLinks" />
    </template>
    <div ui-body>
      <DocsToolbar />
      <!-- The main region's whole width: running text holds its own measure, and tables, code and diagrams take the rest -->
      <div px-4 py-8>
        <DocsPageContent v-if="page" :page />
        <DocsSurround :surround />
      </div>
    </div>
    <AppScrollToTopButton />
  </NuxtLayout>
</template>
