<script setup lang="ts">
import { dayjs } from "#shared/services/dayjs";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { DEFAULT_RESOURCE_SORT_BY, RECENT_RESOURCES_LIMIT } from "@/services/resource/constants";
import { RoutePath } from "@esposter/shared";

definePageMeta({ middleware: "auth" });
useResourceKeyboardShortcuts();

const { isLoading, items: recentResources, readResources } = useReadResources();
// Fetched after mount (not awaited in setup) so the recents card shows its skeleton instead of blocking navigation
const hasLoaded = ref(false);

onMounted(async () => {
  await readResources({ itemsPerPage: RECENT_RESOURCES_LIMIT, page: 1, sortBy: [...DEFAULT_RESOURCE_SORT_BY] });
  hasLoaded.value = true;
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
          <div py-4 flex flex-col gap-8>
            <div py-4 flex justify-center>
              <ResourceSearchMenu placeholder="Search resources, services, and pages (G+/)" is-inline max-w-176 />
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
              <StyledSkeleton v-if="isLoading || !hasLoaded" type="list-item-two-line@5" />
              <StyledEmptyState
                v-else-if="recentResources.length === 0"
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
                    {{ dayjs(resource.updatedAt).fromNow() }}
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </div>
        </v-container>
      </v-sheet>
    </div>
    <ResourceSearchDialog />
    <ResourceShortcutsOverlay />
  </NuxtLayout>
</template>
