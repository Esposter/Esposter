<script setup lang="ts">
import { dayjs } from "#shared/services/dayjs";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { RoutePath } from "@esposter/shared";

definePageMeta({ middleware: "auth" });

const RECENT_RESOURCES_LIMIT = 5;
const searchQuery = ref("");
const { isLoading, items: recentResources, readResources } = useReadResources(ref(""), ref([]));
await readResources({
  itemsPerPage: RECENT_RESOURCES_LIMIT,
  page: 1,
  sortBy: [{ key: "updatedAt", order: SortOrder.Desc }],
});
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>Resource Explorer</Title>
    </Head>
    <div flex flex-col h-full>
      <StyledPageHeader />
      <div flex flex-col gap-8 overflow-y-auto pa-6>
        <v-text-field
          v-model="searchQuery"
          clearable
          density="comfortable"
          hide-details
          label="Search resources"
          max-width="40rem"
          prepend-inner-icon="mdi-magnify"
          @keyup.enter="
            navigateTo({ path: RoutePath.ResourcesAll, query: searchQuery ? { search: searchQuery } : undefined })
          "
        />
        <section flex flex-col gap-4>
          <div flex gap-4 items-center justify-between>
            <span text-h6>Create a resource</span>
            <v-btn color="primary" prepend-icon="mdi-plus" :to="RoutePath.ResourcesCreate">Create a resource</v-btn>
          </div>
          <ResourceCreateGallery dense />
        </section>
        <section flex flex-col gap-4>
          <div flex gap-4 items-center justify-between>
            <span text-h6>Recent resources</span>
            <v-btn append-icon="mdi-arrow-right" variant="text" :to="RoutePath.ResourcesAll">See all</v-btn>
          </div>
          <StyledEmptyState
            v-if="!isLoading && recentResources.length === 0"
            description="Create a resource and it will show up here."
            icon="mdi-folder-multiple-outline"
            title="No resources yet"
          />
          <v-list v-else lines="two">
            <v-list-item
              v-for="resource in recentResources"
              :key="resource.id"
              :prepend-icon="ResourceDefinitionMap[resource.type].icon"
              :subtitle="`${ResourceDefinitionMap[resource.type].title} · ${dayjs(resource.updatedAt).fromNow()}`"
              :title="resource.name"
              :to="RoutePath.Resource(resource.id)"
            />
          </v-list>
        </section>
      </div>
    </div>
  </NuxtLayout>
</template>
