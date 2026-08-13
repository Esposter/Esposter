<script setup lang="ts">
import type { ResourceStatusFilter } from "@/models/resource/list/ResourceStatusFilter";

import { ResourceStatusFilterItems } from "@/services/resource/list/ResourceStatusFilterItems";

const modelValue = defineModel<"" | ResourceStatusFilter>({ required: true });
const emit = defineEmits<{ remove: [] }>();
</script>

<template>
  <ResourceListFilterPill
    is-closed-on-content-click
    is-removable
    label="Status"
    :value="modelValue || 'all'"
    @remove="emit('remove')"
  >
    <v-list density="compact">
      <v-list-item
        v-for="{ title, value } of ResourceStatusFilterItems"
        :key="value"
        :active="modelValue === value"
        :title
        @click="modelValue = value"
      />
    </v-list>
  </ResourceListFilterPill>
</template>
