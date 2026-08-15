<script setup lang="ts">
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

import { dayjs } from "#shared/services/dayjs";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { RoutePath } from "@esposter/shared";

interface ResourceHomeListItemProps {
  resource: ResourceListItem;
}

const { resource } = defineProps<ResourceHomeListItemProps>();
// Favorites are ordered by the resource's own recency, so only Recent has an open time to show
const displayTime = computed(() =>
  resource.lastAccessedAt ? `opened ${dayjs(resource.lastAccessedAt).fromNow()}` : dayjs(resource.updatedAt).fromNow(),
);
</script>

<template>
  <v-list-item
    :prepend-icon="ResourceDefinitionMap[resource.type].icon"
    :title="resource.name"
    :to="RoutePath.Resource(resource.id)"
  >
    <template #subtitle> {{ ResourceDefinitionMap[resource.type].title }} · {{ displayTime }} </template>
  </v-list-item>
</template>
