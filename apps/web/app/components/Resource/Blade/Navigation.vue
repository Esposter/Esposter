<script setup lang="ts">
import type { NavigationItem } from "@/models/shared/NavigationItem";
import type { Resource } from "@esposter/db-schema";

import { getResourceBladeDefinitions } from "@/services/resource/getResourceBladeDefinitions";
import { getResourceBladePath } from "@/services/resource/getResourceBladePath";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";

interface Props {
  activeBlade: string;
  resource: Resource;
}

const { activeBlade, resource } = defineProps<Props>();
const items = computed<NavigationItem[]>(() =>
  getResourceBladeDefinitions(resource.type).map(({ icon, slug, title }) => ({
    icon,
    isActive: activeBlade === slug,
    title,
    to: getResourceBladePath(resource.id, slug),
  })),
);
</script>

<template>
  <StyledNavigationRail
    :items
    hide-text="Hide blade menu"
    show-text="Show blade menu"
    :storage-key="LocalStorageKey.IsResourceBladeNavigationCollapsed"
  />
</template>
