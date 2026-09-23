<script setup lang="ts">
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { Item } from "@/models/shared/Item";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { copyLinkToClipboard } from "@/services/resource/copyLinkToClipboard";
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
const contextMenuProps = getContextMenuProps(resource.id, (): Item[] => {
  const to = RoutePath.Resource(resource.id);
  const isFavorite = favoriteIds.value.has(resource.id);
  return [
    {
      icon: "i-pixelarticons:external-link",
      onClick: () => {
        window.open(to, "_blank");
      },
      title: "Open in new tab",
    },
    { icon: "i-pixelarticons:link", onClick: () => copyLinkToClipboard(to), title: "Copy link" },
    {
      icon: "i-pixelarticons:star",
      isGroupStart: true,
      onClick: () => toggleFavorite(resource),
      title: isFavorite ? "Remove from favorites" : "Add to favorites",
    },
  ];
});
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
    <span p-2 flex shrink-0 ui-sunk>
      <span :class="ResourceDefinitionMap[resource.type].icon" aria-hidden="true" size-6 />
    </span>
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
