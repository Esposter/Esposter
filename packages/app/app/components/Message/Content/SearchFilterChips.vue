<script setup lang="ts">
import { useSearchFilterStore } from "@/store/message/searchFilter";
import { uncapitalize } from "@esposter/shared";

const searchFilterStore = useSearchFilterStore();
const { deleteFilter } = searchFilterStore;
const { selectedFilters } = storeToRefs(searchFilterStore);
</script>

<template>
  <div v-if="selectedFilters.length > 0" class="filter-chips-container">
    <div class="filter-chips">
      <v-chip
        v-for="(filter, index) in selectedFilters"
        :key="`${filter.type}-${filter.value}-${index}`"
        class="ma-1"
        size="small"
        variant="outlined"
        closable
        @click:close="deleteFilter(index)"
      >
        <span class="font-semibold">{{ uncapitalize(filter.type) }}:</span>
        <span class="ml-1">{{ filter.value }}</span>
      </v-chip>
    </div>
  </div>
</template>

<style scoped>
.filter-chips-container {
  padding: 0.5rem 0;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
}
</style>
