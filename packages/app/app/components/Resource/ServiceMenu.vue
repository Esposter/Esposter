<script setup lang="ts">
import type { CollapsibleNavItem } from "@/models/shared/CollapsibleNavItem";

import { ResourceListSource } from "@/models/resource/list/ResourceListSource";
import { ResourceListSourceDefinitionMap } from "@/services/resource/list/ResourceListSourceDefinitionMap";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { RoutePath } from "@esposter/shared";

const route = useRoute();
// Navigation, not state: every entry is a real route, so the set a reader is looking at is deep-linkable,
// Refresh-safe and back-button-safe, and the active entry is decided by the path rather than remembered.
// Matched exactly — Home is a path prefix of every other entry, so a prefix match would leave it lit
// everywhere. The list routes come from the source registry, so adding a source adds a menu entry
const items = computed<CollapsibleNavItem[]>(() =>
  [
    { icon: "mdi-home-outline", title: "Home", to: RoutePath.ResourceExplorer },
    ...Object.values(ResourceListSource).map((source) => {
      const { icon, title, to } = ResourceListSourceDefinitionMap[source];
      return { icon, title, to };
    }),
    { icon: "mdi-tag-multiple-outline", title: "Tags", to: RoutePath.ResourceExplorerTags },
    { icon: "mdi-delete-outline", title: "Recycle bin", to: RoutePath.ResourceExplorerRecycleBin },
  ].map((item) => ({ ...item, isActive: route.path === item.to })),
);
</script>

<!-- The standing left rail for the resource area. Every entry but Home and Tags opens the same list surface
     pointed at a different set, which is what keeps filters, columns, grouping and bulk selection built once -->
<template>
  <StyledCollapsibleNav
    :items
    hide-text="Hide resource menu"
    show-text="Show resource menu"
    :storage-key="LocalStorageKey.IsResourceServiceMenuCollapsed"
  />
</template>
