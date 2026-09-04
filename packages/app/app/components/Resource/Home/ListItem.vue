<script setup lang="ts">
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { RoutePath } from "@esposter/shared";

interface Props {
  resource: ResourceListItem;
}

const { resource } = defineProps<Props>();
</script>

<template>
  <v-list-item
    :prepend-icon="ResourceDefinitionMap[resource.type].icon"
    :title="resource.name"
    :to="RoutePath.Resource(resource.id)"
  >
    <template #subtitle>
      {{ ResourceDefinitionMap[resource.type].title }} ·
      <!-- Favorites are ordered by the resource's own recency, so only Recent has an open time to show -->
      <template v-if="resource.lastAccessedAt">
        opened <NuxtTime :datetime="resource.lastAccessedAt" relative />
      </template>
      <NuxtTime v-else :datetime="resource.updatedAt" relative />
    </template>
  </v-list-item>
</template>
