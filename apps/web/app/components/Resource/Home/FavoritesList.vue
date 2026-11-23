<script setup lang="ts">
import { useReadFavorites } from "#src/composables/resource/useReadFavorites";
import { ResourceListSource } from "#src/models/resource/list/ResourceListSource";
import { useFavoriteStore } from "#src/store/resource/favorite";

const favoriteStore = useFavoriteStore();
const { favorites, hasMore, isLoaded } = storeToRefs(favoriteStore);
const { isError, readFavorites, readMoreFavorites } = useReadFavorites();

onMounted(async () => {
  await readFavorites();
});
</script>

<!-- Loading only while there is nothing to show: the rows a read already put in the store stay on screen while the
  next page is out, and an empty set is an answer only once a page has landed. The waypoint loads the page after the
  last one shown -->
<template>
  <UiErrorState v-if="isError" error="The favorites could not be read" @retry="readFavorites()" />
  <template v-else>
    <ResourceHomeList
      :is-pending="favorites.length === 0 && !isLoaded"
      :resources="favorites"
      :source="ResourceListSource.Favorites"
    />
    <StyledWaypoint :is-active="hasMore" @change="(onComplete) => readMoreFavorites(onComplete)" />
  </template>
</template>
