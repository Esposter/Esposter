<script setup lang="ts">
import type { NavigationItem } from "@/models/shared/NavigationItem";

import { ResourceListSource } from "@/models/resource/list/ResourceListSource";
import { ResourceListSourceDefinitionMap } from "@/services/resource/list/ResourceListSourceDefinitionMap";
import { RoutePath } from "@esposter/shared";

const isOpen = defineModel<boolean>({ required: true });
const { currentRoute } = useRouter();
// Navigation, not state: every entry is a real route, so the set a reader is looking at is deep-linkable,
// Refresh-safe and back-button-safe, and the active entry is decided by the path rather than remembered.
// Matched exactly — Home is a path prefix of every other entry, so a prefix match would leave it lit
// Everywhere. The list routes come from the source registry, so adding a source adds a menu entry
const items = computed<NavigationItem[]>(() =>
  [
    { icon: "mdi-home-outline", title: "Home", to: RoutePath.ResourceExplorer },
    ...Object.values(ResourceListSource).map((source) => {
      const { icon, title, to } = ResourceListSourceDefinitionMap[source];
      return { icon, title, to };
    }),
    { icon: "mdi-tag-multiple-outline", title: "Tags", to: RoutePath.ResourceExplorerTags },
    { icon: "mdi-delete-outline", title: "Recycle bin", to: RoutePath.ResourceExplorerRecycleBin },
  ].map(({ icon, title, to }) => ({ icon, isActive: currentRoute.value.path === to, title, to })),
);
</script>

<!-- The resource area's own menu. Every entry but Home and Tags opens the same list surface pointed at a
     different set, which is what keeps filters, columns, grouping and bulk selection built once -->
<template>
  <StyledNavigationOverlay v-model="isOpen" :items />
</template>
