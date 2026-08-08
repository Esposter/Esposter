<script setup lang="ts">
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { ResourceListSource } from "@/models/resource/list/ResourceListSource";

import { dayjs } from "#shared/services/dayjs";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceListSourceDefinitionMap } from "@/services/resource/list/ResourceListSourceDefinitionMap";
import { RoutePath } from "@esposter/shared";

interface ResourceHomeListProps {
  isLoading?: boolean;
  resources: ResourceListItem[];
  source: ResourceListSource;
}

const { isLoading, resources, source } = defineProps<ResourceHomeListProps>();
</script>

<template>
  <StyledSkeleton v-if="isLoading" type="list-item-two-line@5" />
  <StyledEmptyState v-else-if="resources.length === 0" :="ResourceListSourceDefinitionMap[source].emptyState" />
  <v-list v-else lines="two">
    <v-list-item
      v-for="resource in resources"
      :key="resource.id"
      :prepend-icon="ResourceDefinitionMap[resource.type].icon"
      :title="resource.name"
      :to="RoutePath.Resource(resource.id)"
    >
      <template #subtitle>
        {{ ResourceDefinitionMap[resource.type].title }} ·
        <!-- Favorites are ordered by the resource's own recency, so only Recent has an open time to show -->
        <template v-if="resource.lastAccessedAt">opened {{ dayjs(resource.lastAccessedAt).fromNow() }}</template>
        <template v-else>{{ dayjs(resource.updatedAt).fromNow() }}</template>
      </template>
    </v-list-item>
  </v-list>
</template>
