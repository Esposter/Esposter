<script setup lang="ts">
import type { ResourceListFilterTypeDefinition } from "@/models/resource/list/ResourceListFilterTypeDefinition";
import type { ResourceStatusFilter } from "@/models/resource/list/ResourceStatusFilter";
import type { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";
import type { ResourceType } from "@esposter/db-schema";

import { ResourceListFilterType, ResourceListFilterTypes } from "@/models/resource/list/ResourceListFilterType";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  hasActiveFilters: boolean;
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
// Every choice in the Add filter menu leads with the mark of what it filters by
const filterTypeMeaningMap = {
  [ResourceListFilterType.Status]: UiIconMeaning.Publish,
  [ResourceListFilterType.Tag]: UiIconMeaning.Tag,
  [ResourceListFilterType.Updated]: UiIconMeaning.Recent,
} as const satisfies Record<ResourceListFilterType, UiIconMeaning>;
const availableFilterItems = computed(() =>
  ResourceListFilterTypes.filter((filterType) => !filterTypeDefinitionMap[filterType].isVisible.value).map(
    (filterType) => ({ meaning: filterTypeMeaningMap[filterType], title: filterType, value: filterType }),
  ),
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

<!-- The pills flow on from each other and wrap as one run, so nothing is pushed to the far end of a second line -->
<template>
  <div px-4 pb-2 flex flex-wrap gap-2 items-center>
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
    <UiMenu
      v-if="availableFilterItems.length > 0"
      is-label-shown
      :items="availableFilterItems"
      label="Add filter"
      :variant="UiButtonVariant.Quiet"
      @select="
        (filterType) => {
          addedFilterTypes = [...addedFilterTypes, filterType];
        }
      "
    >
      <UiIcon :meaning="UiIconMeaning.Create" />
      Add filter
    </UiMenu>
    <UiButton v-if="hasActiveFilters" :variant="UiButtonVariant.Quiet" @click="clearFilters()">
      Clear filters
    </UiButton>
  </div>
</template>
