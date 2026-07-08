<script setup lang="ts">
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { dayjs } from "#shared/services/dayjs";
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
      <v-sheet flex-1 overflow-y-auto>
        <v-container>
          <div flex flex-col gap-8 py-4>
            <div flex justify-center py-4>
              <v-text-field
                v-model="searchQuery"
                clearable
                hide-details
                max-width="44rem"
                placeholder="Search resources, services, and docs (G+/)"
                prepend-inner-icon="mdi-magnify"
                variant="solo"
                w-full
                @keyup.enter="
                  navigateTo({ path: RoutePath.ResourcesAll, query: searchQuery ? { search: searchQuery } : undefined })
                "
              />
            </div>
            <v-card>
              <v-card-item>
                <div flex flex-wrap gap-4 items-center justify-between>
                  <span text-h6>Create a resource</span>
                  <StyledButton :button-props="{ prependIcon: 'mdi-plus', to: RoutePath.ResourcesCreate }">
                    Create a resource
                  </StyledButton>
                </div>
              </v-card-item>
              <v-card-text>
                <ResourceCreateGallery dense />
              </v-card-text>
            </v-card>
            <v-card>
              <v-card-item>
                <div flex flex-wrap gap-4 items-center justify-between>
                  <span text-h6>Recent resources</span>
                  <v-btn append-icon="mdi-arrow-right" variant="text" :to="RoutePath.ResourcesAll">See all</v-btn>
                </div>
              </v-card-item>
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
                  :title="resource.name"
                  :to="RoutePath.Resource(resource.id)"
                >
                  <template #subtitle>
                    {{ ResourceDefinitionMap[resource.type].title }} ·
                    <ClientOnly>{{ dayjs(resource.updatedAt).fromNow() }}</ClientOnly>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </div>
        </v-container>
      </v-sheet>
    </div>
  </NuxtLayout>
</template>
