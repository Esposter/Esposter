<script setup lang="ts">
import type { RecentResource } from "@/models/resource/RecentResource";

import { dayjs } from "#shared/services/dayjs";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { RoutePath } from "@esposter/shared";

interface ResourceHomeListProps {
  emptyDescription: string;
  emptyIcon: string;
  emptyTitle: string;
  isLoading?: boolean;
  resources: RecentResource[];
}

const { emptyDescription, emptyIcon, emptyTitle, isLoading, resources } = defineProps<ResourceHomeListProps>();
</script>

<template>
  <StyledSkeleton v-if="isLoading" type="list-item-two-line@5" />
  <StyledEmptyState
    v-else-if="resources.length === 0"
    :description="emptyDescription"
    :icon="emptyIcon"
    :title="emptyTitle"
  />
  <v-list v-else lines="two">
    <v-list-item
      v-for="resource in resources"
      :key="resource.id"
      link
      :prepend-icon="ResourceDefinitionMap[resource.type].icon"
      :title="resource.name"
      @click="navigateTo(RoutePath.Resource(resource.id))"
    >
      <template #subtitle>
        {{ ResourceDefinitionMap[resource.type].title }} ·
        <!-- Views recorded before recents tracked a timestamp have none, so fall back to the row's own recency -->
        <template v-if="resource.viewedAt">viewed {{ dayjs(resource.viewedAt).fromNow() }}</template>
        <template v-else>{{ dayjs(resource.updatedAt).fromNow() }}</template>
      </template>
    </v-list-item>
  </v-list>
</template>
