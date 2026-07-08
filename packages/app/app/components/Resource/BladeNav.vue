<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { ResourceBladeType, ResourceBladeTypes } from "@/models/resource/ResourceBladeType";
import { ResourceBladeTitleMap } from "@/services/resource/ResourceBladeTitleMap";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { RoutePath } from "@esposter/shared";

interface ResourceBladeNavProps {
  activeBlade: ResourceBladeType;
  resource: Resource;
}

const { activeBlade, resource } = defineProps<ResourceBladeNavProps>();
// Titles collapse to an icon rail on mobile so the blade content keeps the width.
const { smAndDown } = useVDisplay();
const items = computed(() =>
  [...ResourceBladeTypes].map((blade) => ({
    blade,
    icon: blade === ResourceBladeType.Editor ? ResourceDefinitionMap[resource.type].icon : "mdi-information-outline",
    title: ResourceBladeTitleMap[blade],
    to:
      blade === ResourceBladeType.Overview
        ? RoutePath.Resource(resource.id)
        : `${RoutePath.Resource(resource.id)}/${blade}`,
  })),
);
</script>

<template>
  <v-list nav>
    <v-list-item
      v-for="item in items"
      :key="item.blade"
      :active="activeBlade === item.blade"
      :prepend-icon="item.icon"
      :title="smAndDown ? undefined : item.title"
      :to="item.to"
    />
  </v-list>
</template>
