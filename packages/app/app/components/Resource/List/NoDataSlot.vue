<script setup lang="ts">
interface ResourceListNoDataSlotProps {
  error: string;
  hasActiveFilters: boolean;
}

defineProps<ResourceListNoDataSlotProps>();
const emit = defineEmits<{ clear: []; refresh: [] }>();
</script>

<template>
  <StyledEmptyState v-if="error" icon="mdi-alert-circle-outline" title="Something went wrong" :description="error">
    <v-btn prepend-icon="mdi-refresh" variant="tonal" @click="emit('refresh')">Retry</v-btn>
  </StyledEmptyState>
  <StyledEmptyState
    v-else-if="hasActiveFilters"
    icon="mdi-filter-off-outline"
    title="No resources match your filters"
    description="Try adjusting or clearing your filters."
  >
    <v-btn variant="tonal" @click="emit('clear')">Clear filters</v-btn>
  </StyledEmptyState>
  <StyledEmptyState
    v-else
    icon="mdi-folder-multiple-outline"
    title="No resources yet"
    description="Create a resource and it will show up here."
  />
</template>
