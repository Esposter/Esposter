<script setup lang="ts">
import type { ResourceListSource } from "@/models/resource/list/ResourceListSource";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { ResourceListSourceDefinitionMap } from "@/services/resource/list/ResourceListSourceDefinitionMap";

interface Props {
  error: string;
  hasActiveFilters: boolean;
  source: ResourceListSource;
}

const { error, hasActiveFilters, source } = defineProps<Props>();
const emit = defineEmits<{ clear: []; refresh: [] }>();
</script>

<template>
  <UiErrorState v-if="error" :error @retry="emit('refresh')" />
  <UiEmptyState
    v-else-if="hasActiveFilters"
    description="Try adjusting or clearing your filters."
    :meaning="UiIconMeaning.Filter"
    title="No resources match your filters"
  >
    <UiButton @click="emit('clear')">Clear filters</UiButton>
  </UiEmptyState>
  <!-- An empty Favorites list is not an empty account, so the copy comes from the set the view is over -->
  <UiEmptyState
    v-else
    :="ResourceListSourceDefinitionMap[source].emptyState"
    :meaning="ResourceListSourceDefinitionMap[source].meaning"
  />
</template>
