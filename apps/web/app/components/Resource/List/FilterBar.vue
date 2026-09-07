<script setup lang="ts">
import type { ResourceStatusFilter } from "@/models/resource/list/ResourceStatusFilter";
import type { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";
import type { ResourceType } from "@esposter/db-schema";

import { ResourceListFilterType, ResourceListFilterTypes } from "@/models/resource/list/ResourceListFilterType";

interface Props {
  hasActiveFilters: boolean;
}

interface ResourceListFilterTypeDefinition {
  isVisible: ComputedRef<boolean>;
  reset: () => void;
}

const { hasActiveFilters } = defineProps<Props>();
const types = defineModel<ResourceType[]>("types", { required: true });
const status = defineModel<"" | ResourceStatusFilter>("status", { required: true });
const updatedFilter = defineModel<"" | ResourceUpdatedFilter>("updatedFilter", { required: true });
const tagName = defineModel<string>("tagName", { required: true });
const tagValue = defineModel<string>("tagValue", { required: true });
const updatedAfter = defineModel<Date | undefined>("updatedAfter", { required: true });
const updatedBefore = defineModel<Date | undefined>("updatedBefore", { required: true });
const emit = defineEmits<{ clear: [] }>();
// A pill stays visible while empty ("all") after being added, until its ✕ removes it —
// A deep-linked filter value also surfaces its pill without an explicit add
const addedFilterTypes = ref<ResourceListFilterType[]>([]);
const isStatusPillVisible = computed(
  () => Boolean(status.value) || addedFilterTypes.value.includes(ResourceListFilterType.Status),
);
const isUpdatedPillVisible = computed(
  () => Boolean(updatedFilter.value) || addedFilterTypes.value.includes(ResourceListFilterType.Updated),
);
const isTagPillVisible = computed(
  () => Boolean(tagName.value) || addedFilterTypes.value.includes(ResourceListFilterType.Tag),
);
// Keyed by filter type so adding a new ResourceListFilterType is a compile error here instead of a silent fallthrough
const filterTypeDefinitionMap: Record<ResourceListFilterType, ResourceListFilterTypeDefinition> = {
  [ResourceListFilterType.Status]: {
    isVisible: isStatusPillVisible,
    reset: () => {
      status.value = "";
    },
  },
  [ResourceListFilterType.Tag]: {
    isVisible: isTagPillVisible,
    reset: () => {
      tagName.value = "";
      tagValue.value = "";
    },
  },
  [ResourceListFilterType.Updated]: {
    isVisible: isUpdatedPillVisible,
    reset: () => {
      updatedFilter.value = "";
      updatedAfter.value = undefined;
      updatedBefore.value = undefined;
    },
  },
};
const availableFilterTypes = computed(() =>
  ResourceListFilterTypes.filter((filterType) => !filterTypeDefinitionMap[filterType].isVisible.value),
);
const removeFilter = (filterType: ResourceListFilterType) => {
  filterTypeDefinitionMap[filterType].reset();
  addedFilterTypes.value = addedFilterTypes.value.filter((addedFilterType) => addedFilterType !== filterType);
};
const clearFilters = () => {
  addedFilterTypes.value = [];
  emit("clear");
};
</script>

<template>
  <div px-4 py-2 b-0 b-b-1 b-border b-solid flex flex-wrap gap-2 items-center>
    <ResourceListTypeFilterPill v-model="types" />
    <ResourceListStatusFilterPill
      v-if="isStatusPillVisible"
      v-model="status"
      @remove="removeFilter(ResourceListFilterType.Status)"
    />
    <ResourceListTagFilterPill
      v-if="isTagPillVisible"
      v-model:tag-name="tagName"
      v-model:tag-value="tagValue"
      @remove="removeFilter(ResourceListFilterType.Tag)"
    />
    <ResourceListUpdatedFilterPill
      v-if="isUpdatedPillVisible"
      v-model:updated-after="updatedAfter"
      v-model:updated-before="updatedBefore"
      v-model:updated-filter="updatedFilter"
      @remove="removeFilter(ResourceListFilterType.Updated)"
    />
    <v-menu v-if="availableFilterTypes.length > 0">
      <template #activator="{ props: menuProps }">
        <v-chip prepend-icon="mdi-plus" variant="text" :="menuProps">Add filter</v-chip>
      </template>
      <v-list density="compact">
        <v-list-item
          v-for="filterType of availableFilterTypes"
          :key="filterType"
          :title="filterType"
          @click="addedFilterTypes = [...addedFilterTypes, filterType]"
        />
      </v-list>
    </v-menu>
    <v-spacer />
    <v-btn v-if="hasActiveFilters" size="small" variant="text" @click="clearFilters()">Clear filters</v-btn>
  </div>
</template>
