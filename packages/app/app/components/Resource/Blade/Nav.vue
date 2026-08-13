<script setup lang="ts">
import type { NavItem } from "@/models/shared/NavItem";
import type { Resource } from "@esposter/db-schema";

import { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import { getResourceBladeDefinitions } from "@/services/resource/getResourceBladeDefinitions";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { RoutePath } from "@esposter/shared";

interface ResourceBladeNavProps {
  activeBlade: string;
  resource: Resource;
}

const { activeBlade, resource } = defineProps<ResourceBladeNavProps>();
// Overview is the resource's own path; every other blade hangs off it as a segment
const items = computed<NavItem[]>(() => {
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
  <StyledCollapsibleNav
    :items
    hide-text="Hide blade menu"
    show-text="Show blade menu"
    :storage-key="LocalStorageKey.IsResourceBladeNavCollapsed"
  />
</template>
