<script setup lang="ts">
import type { ResourceStatusFilter } from "@/models/resource/list/ResourceStatusFilter";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { ResourceStatusFilterItems } from "@/services/resource/list/ResourceStatusFilterItems";

const modelValue = defineModel<"" | ResourceStatusFilter>({ required: true });
const emit = defineEmits<{ remove: [] }>();
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
      :selected-values="[modelValue]"
      @toggle="
        (value) => {
          modelValue = value;
          close();
        }
      "
    />
  </ResourceListFilterPill>
</template>
