<script setup lang="ts">
import type { NavigationItem } from "@/models/shared/NavigationItem";
import type { Resource } from "@esposter/db-schema";

import { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import { getResourceBladeDefinitions } from "@/services/resource/getResourceBladeDefinitions";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { RoutePath } from "@esposter/shared";

interface ResourceBladeNavigationProps {
  activeBlade: string;
  resource: Resource;
}

const { activeBlade, resource } = defineProps<ResourceBladeNavigationProps>();
// Overview is the resource's own path; every other blade hangs off it as a segment
const items = computed<NavigationItem[]>(() => {
  const resourcePath = RoutePath.Resource(resource.id);
  return getResourceBladeDefinitions(resource.type).map(({ icon, slug, title }) => ({
    icon,
    isActive: activeBlade === slug,
    title,
    to: slug === ResourceBladeType.Overview ? resourcePath : `${resourcePath}/${slug}`,
  }));
});
</script>

<template>
  <StyledNavigationRail
    :items
    hide-text="Hide blade menu"
    show-text="Show blade menu"
    :storage-key="LocalStorageKey.IsResourceBladeNavigationCollapsed"
  />
</template>
