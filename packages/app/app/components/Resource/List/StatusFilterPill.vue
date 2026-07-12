<script setup lang="ts">
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { ResourceStatusFilter } from "@/models/resource/list/ResourceStatusFilter";

const modelValue = defineModel<"" | ResourceStatusFilter>({ required: true });
const emit = defineEmits<{ remove: [] }>();
const statusItems: SelectItemCategoryDefinition<"" | ResourceStatusFilter>[] = [
  { title: "All", value: "" },
  { title: ResourceStatusFilter.Published, value: ResourceStatusFilter.Published },
  { title: ResourceStatusFilter.Draft, value: ResourceStatusFilter.Draft },
];
</script>

<template>
  <v-menu>
    <template #activator="{ props: menuProps }">
      <v-chip closable :="menuProps" @click:close="emit('remove')">Status == {{ modelValue || "all" }}</v-chip>
    </template>
    <v-list density="compact">
      <v-list-item
        v-for="{ title, value } of statusItems"
        :key="title"
        :active="modelValue === value"
        :title
        @click="modelValue = value"
      />
    </v-list>
  </v-menu>
</template>
