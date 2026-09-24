<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useFavoriteStore } from "@/store/resource/favorite";

interface Props {
  resource: Resource;
}

const { resource } = defineProps<Props>();
const favoriteStore = useFavoriteStore();
const { favoriteIds } = storeToRefs(favoriteStore);
const { toggleFavorite } = favoriteStore;
</script>

<!-- A toggle keeps one name and says whether it is on, so the star fills in the accent while the resource is one -->
<template>
  <UiIconButton
    :aria-pressed="favoriteIds.has(resource.id)"
    label="Favorite"
    :meaning="UiIconMeaning.Favorite"
    :variant="UiButtonVariant.Quiet"
    @click="toggleFavorite(resource)"
  />
</template>
