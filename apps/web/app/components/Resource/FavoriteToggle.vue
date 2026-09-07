<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";
import type { VBtn } from "vuetify/components";

import { useFavoriteStore } from "@/store/resource/favorite";

interface Props {
  resource: Resource;
}

const { resource } = defineProps<Props>();
const favoriteStore = useFavoriteStore();
const { favoriteIds } = storeToRefs(favoriteStore);
const { toggleFavorite } = favoriteStore;
const isFavorite = computed(() => favoriteIds.value.has(resource.id));
const buttonProps = computed<VBtn["$props"]>(() => ({
  color: isFavorite.value ? "warning" : undefined,
  variant: "text",
}));
</script>

<template>
  <StyledTooltipIconButton
    :icon="isFavorite ? 'mdi-star' : 'mdi-star-outline'"
    :text="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
    :button-props
    @click="toggleFavorite(resource)"
  />
</template>
