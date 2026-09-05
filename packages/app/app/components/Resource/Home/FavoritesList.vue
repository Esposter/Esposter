<script setup lang="ts">
import { ResourceListSource } from "@/models/resource/list/ResourceListSource";
import { useFavoriteStore } from "@/store/resource/favorite";

const favoriteStore = useFavoriteStore();
const { favorites, isPending } = storeToRefs(favoriteStore);
const { readFavorites } = favoriteStore;
const isLoaded = ref(false);

onMounted(async () => {
  await readFavorites();
  isLoaded.value = true;
});
</script>

<template>
  <ResourceHomeList
    :is-pending="isPending || !isLoaded"
    :resources="favorites"
    :source="ResourceListSource.Favorites"
  />
</template>
