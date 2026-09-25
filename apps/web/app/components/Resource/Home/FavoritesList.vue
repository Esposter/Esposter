<script setup lang="ts">
import { ResourceListSource } from "@/models/resource/list/ResourceListSource";
import { useFavoriteStore } from "@/store/resource/favorite";

const favoriteStore = useFavoriteStore();
const { favorites, isPending, isReadSettled } = storeToRefs(favoriteStore);
const { readFavorites } = favoriteStore;

onMounted(async () => {
  await readFavorites();
});
</script>

<!-- Loading only while there is nothing to show: the rows a read already put in the store stay on screen while the
     next one is out, and an empty set is an answer only once a read has settled -->
<template>
  <ResourceHomeList
    :is-pending="favorites.length === 0 && (isPending || !isReadSettled)"
    :resources="favorites"
    :source="ResourceListSource.Favorites"
  />
</template>
