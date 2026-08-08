<script setup lang="ts">
import { ResourceHomeTab, ResourceHomeTabs } from "@/models/resource/ResourceHomeTab";
import { ResourceHomeTabSourceMap } from "@/services/resource/ResourceHomeTabSourceMap";
import { useFavoriteStore } from "@/store/resource/favorite";
import { RoutePath } from "@esposter/shared";

const tab = useEnumRouteQuery("tab", ResourceHomeTabs, ResourceHomeTab.Recent);
const {
  error: recentError,
  isLoading: isLoadingRecent,
  readRecentResources,
  recentResources,
} = useReadRecentResources();
const favoriteStore = useFavoriteStore();
const { favorites, isLoading: isLoadingFavorites } = storeToRefs(favoriteStore);
// Fetched after mount (not awaited in setup) so the card shows its skeleton instead of blocking navigation
const hasLoaded = ref(false);

onMounted(async () => {
  await Promise.all([readRecentResources(), favoriteStore.readFavorites()]);
  hasLoaded.value = true;
});
</script>

<!-- Home's preview of the two sets the service menu gives full list routes. Each tab is the top few rows;
     See all opens the workbench where they can be filtered, sorted and acted on in bulk -->
<template>
  <v-card>
    <v-card-item>
      <div flex flex-wrap gap-4 items-center justify-between>
        <span text-h6>Resources</span>
        <v-btn :to="RoutePath.ResourceExplorerAll" append-icon="mdi-arrow-right" variant="text">See all</v-btn>
      </div>
    </v-card-item>
    <v-tabs v-model="tab">
      <v-tab :value="ResourceHomeTab.Recent">Recent</v-tab>
      <v-tab :value="ResourceHomeTab.Favorites">Favorites</v-tab>
    </v-tabs>
    <v-tabs-window v-model="tab">
      <v-tabs-window-item :value="ResourceHomeTab.Recent">
        <v-alert v-if="recentError" ma-4 density="compact" type="error" :text="recentError">
          <template #append>
            <v-btn size="small" variant="text" @click="readRecentResources()">Retry</v-btn>
          </template>
        </v-alert>
        <ResourceHomeList
          v-else
          :is-loading="isLoadingRecent || !hasLoaded"
          :resources="recentResources"
          :source="ResourceHomeTabSourceMap[ResourceHomeTab.Recent]"
        />
      </v-tabs-window-item>
      <v-tabs-window-item :value="ResourceHomeTab.Favorites">
        <ResourceHomeList
          :is-loading="isLoadingFavorites || !hasLoaded"
          :resources="favorites"
          :source="ResourceHomeTabSourceMap[ResourceHomeTab.Favorites]"
        />
      </v-tabs-window-item>
    </v-tabs-window>
  </v-card>
</template>
