<script setup lang="ts">
import type { ResourceType } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceTypeListItems } from "@/services/resource/list/ResourceTypeListItems";

const modelValue = defineModel<ResourceType[]>({ required: true });
const selectedTypesText = computed(() =>
  modelValue.value.length > 0 ? modelValue.value.map((type) => ResourceDefinitionMap[type].title).join(", ") : "all",
);
</script>

<!-- Several types at once, so the panel stays open while they are picked -->
<template>
  <ResourceListFilterPill label="Type" :value="selectedTypesText">
    <ResourceListFilterOptions
      :items="ResourceTypeListItems"
      :selected-values="modelValue"
      @toggle="
        (type) => {
          modelValue = modelValue.includes(type)
            ? modelValue.filter((selectedType) => selectedType !== type)
            : [...modelValue, type];
        }
      "
    />
  </ResourceListFilterPill>
</template>
