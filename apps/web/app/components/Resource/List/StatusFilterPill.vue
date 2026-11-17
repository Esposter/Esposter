<script setup lang="ts">
import type { ResourceStatusFilter } from "#src/models/resource/list/ResourceStatusFilter";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { ResourceStatusFilterItems } from "#src/services/resource/list/ResourceStatusFilterItems";

const modelValue = defineModel<"" | ResourceStatusFilter>({ required: true });
const emit = defineEmits<{ remove: [] }>();
const selectedValues = computed(() => [modelValue.value]);
</script>

<template>
  <ResourceListFilterPill
    #default="{ close }"
    is-removable
    label="Status"
    :value="modelValue || 'all'"
    @remove="emit('remove')"
  >
    <ResourceListFilterOptions
      :items="ResourceStatusFilterItems"
      :meaning="UiIconMeaning.Publish"
      :selected-values
      @toggle="
        (value) => {
          modelValue = value;
          close();
        }
      "
    />
  </ResourceListFilterPill>
</template>
