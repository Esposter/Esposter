<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { useFavoriteStore } from "@/store/resource/favorite";

interface ResourceFavoriteToggleProps {
  resource: Resource;
}

const { resource } = defineProps<ResourceFavoriteToggleProps>();
const favoriteStore = useFavoriteStore();
const { favoriteIds } = storeToRefs(favoriteStore);
const isFavorite = computed(() => favoriteIds.value.has(resource.id));
</script>

<template>
  <StyledTooltipIconButton
    :icon="isFavorite ? 'mdi-star' : 'mdi-star-outline'"
    :text="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
    :button-props="{ color: isFavorite ? 'warning' : undefined }"
    @click="favoriteStore.toggleFavorite(resource)"
  />
</template>
