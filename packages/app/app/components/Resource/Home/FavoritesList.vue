<script setup lang="ts">
import { ResourceListSource } from "@/models/resource/list/ResourceListSource";
import { useFavoriteStore } from "@/store/resource/favorite";

const favoriteStore = useFavoriteStore();
const { favorites, isLoading } = storeToRefs(favoriteStore);
const { readFavorites } = favoriteStore;
// Fetched after mount (not awaited in setup) so the card shows its skeleton instead of blocking navigation
const hasLoaded = ref(false);

onMounted(async () => {
  await readFavorites();
  hasLoaded.value = true;
});
</script>

<template>
  <ResourceHomeList
    :is-loading="isLoading || !hasLoaded"
    :resources="favorites"
    :source="ResourceListSource.Favorites"
  />
</template>
