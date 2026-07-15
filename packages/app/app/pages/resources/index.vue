<script setup lang="ts">
import { ResourceHomeTab, ResourceHomeTabs } from "@/models/resource/ResourceHomeTab";
import { useFavoriteStore } from "@/store/resource/favorite";
import { RoutePath } from "@esposter/shared";

definePageMeta({ middleware: "auth" });
useResourceKeyboardShortcuts();

const tab = useEnumRouteQuery("tab", ResourceHomeTabs, ResourceHomeTab.Recent);
const { isLoading: isLoadingRecent, readRecentResources, recentResources } = useReadRecentResources();
const favoriteStore = useFavoriteStore();
const { favorites, isLoading: isLoadingFavorites } = storeToRefs(favoriteStore);
// Fetched after mount (not awaited in setup) so the card shows its skeleton instead of blocking navigation
const hasLoaded = ref(false);

onMounted(async () => {
  await Promise.all([readRecentResources(), favoriteStore.readFavorites()]);
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
                  <span text-h6>Resources</span>
                  <v-btn append-icon="mdi-arrow-right" variant="text" :to="RoutePath.ResourcesAll">See all</v-btn>
                </div>
              </v-card-item>
              <v-tabs v-model="tab">
                <v-tab :value="ResourceHomeTab.Recent">Recent</v-tab>
                <v-tab :value="ResourceHomeTab.Favorites">Favorites</v-tab>
              </v-tabs>
              <v-tabs-window v-model="tab">
                <v-tabs-window-item :value="ResourceHomeTab.Recent">
                  <ResourceHomeList
                    empty-description="Open a resource and it will show up here."
                    empty-icon="mdi-folder-multiple-outline"
                    empty-title="No recent resources"
                    :is-loading="isLoadingRecent || !hasLoaded"
                    :resources="recentResources"
                  />
                </v-tabs-window-item>
                <v-tabs-window-item :value="ResourceHomeTab.Favorites">
                  <ResourceHomeList
                    empty-description="Star a resource and it will show up here."
                    empty-icon="mdi-star-outline"
                    empty-title="No favorites yet"
                    :is-loading="isLoadingFavorites || !hasLoaded"
                    :resources="favorites"
                  />
                </v-tabs-window-item>
              </v-tabs-window>
            </v-card>
          </div>
        </v-container>
      </v-sheet>
    </div>
    <ResourceSearchDialog />
    <ResourceShortcutsOverlay />
  </NuxtLayout>
</template>
