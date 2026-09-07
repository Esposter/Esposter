<script setup lang="ts">
import type { ResourceListSource } from "@/models/resource/list/ResourceListSource";

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
  <StyledErrorState v-if="error" :error @retry="emit('refresh')" />
  <StyledEmptyState
    v-else-if="hasActiveFilters"
    icon="mdi-filter-off-outline"
    title="No resources match your filters"
    description="Try adjusting or clearing your filters."
  >
    <v-btn variant="tonal" @click="emit('clear')">Clear filters</v-btn>
  </StyledEmptyState>
  <!-- An empty Favorites list is not an empty account, so the copy comes from the set the view is over -->
  <StyledEmptyState
    v-else
    :="ResourceListSourceDefinitionMap[source].emptyState"
    :icon="ResourceListSourceDefinitionMap[source].icon"
  />
</template>
