<script setup lang="ts">
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { ResourceListSource } from "@/models/resource/list/ResourceListSource";

import { ResourceListSourceDefinitionMap } from "@/services/resource/list/ResourceListSourceDefinitionMap";

interface Props {
  isPending?: boolean;
  resources: ResourceListItem[];
  source: ResourceListSource;
}

const { isPending, resources, source } = defineProps<Props>();
</script>

<template>
  <StyledSkeleton v-if="isPending" type="list-item-two-line@5" />
  <StyledEmptyState
    v-else-if="resources.length === 0"
    :="ResourceListSourceDefinitionMap[source].emptyState"
    :icon="ResourceListSourceDefinitionMap[source].icon"
  />
  <v-list v-else lines="two">
    <ResourceHomeListItem v-for="resource in resources" :key="resource.id" :resource />
  </v-list>
</template>
