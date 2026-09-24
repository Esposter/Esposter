<script setup lang="ts">
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { UiItem } from "@/models/ui/UiItem";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getResourceLinkItems } from "@/services/resource/getResourceLinkItems";
import { useFavoriteStore } from "@/store/resource/favorite";
import { RoutePath } from "@esposter/shared";

interface Props {
  resource: ResourceListItem;
}

const { resource } = defineProps<Props>();
const favoriteStore = useFavoriteStore();
const { favoriteIds } = storeToRefs(favoriteStore);
const { toggleFavorite } = favoriteStore;
const { getContextMenuProps } = useContextMenu();
// What a glance at Home wants without opening the resource: it beside this page, its link, and whether it stays one of
// The favorites. Renaming and deleting are the workbench's, where the row is one of a list that can take them
const contextMenuProps = getContextMenuProps(resource.id, (): UiItem[] => [
  ...getResourceLinkItems(resource.id),
  {
    isGroupStart: true,
    meaning: UiIconMeaning.Favorite,
    onClick: () => toggleFavorite(resource),
    title: favoriteIds.value.has(resource.id) ? "Remove from favorites" : "Add to favorites",
  },
]);
</script>

<!-- The resource as an item in its slot, as the page header draws the one open: the type's mark in a sunk block beside
     its name, and what it is and when it was last touched under that -->
<template>
  <NuxtInvisibleLink
    :="contextMenuProps"
    :to="RoutePath.Resource(resource.id)"
    p-2
    flex
    gap-3
    min-w-0
    items-center
    hover:bg="accent/10"
  >
    <ResourceTypeMark :type="resource.type" />
    <span flex flex-col min-w-0>
      <span truncate>{{ resource.name }}</span>
      <span text-muted truncate>
        {{ ResourceDefinitionMap[resource.type].title }} ·
        <!-- Favorites are ordered by the resource's own recency, so only Recent has an open time to show -->
        <template v-if="resource.lastAccessedAt">
          opened <NuxtTime :datetime="resource.lastAccessedAt" relative />
        </template>
        <NuxtTime v-else :datetime="resource.updatedAt" relative />
      </span>
    </span>
  </NuxtInvisibleLink>
</template>
