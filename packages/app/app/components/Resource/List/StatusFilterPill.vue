<script setup lang="ts">
import type { ResourceStatusFilter } from "@/models/resource/list/ResourceStatusFilter";

import { ResourceStatusFilterItems } from "@/services/resource/list/ResourceStatusFilterItems";

const modelValue = defineModel<"" | ResourceStatusFilter>({ required: true });
const emit = defineEmits<{ remove: [] }>();
</script>

<template>
  <v-menu>
    <template #activator="{ props: menuProps }">
      <v-chip closable :="menuProps" @click:close="emit('remove')">Status == {{ modelValue || "all" }}</v-chip>
    </template>
    <v-list density="compact">
      <v-list-item
        v-for="{ title, value } of ResourceStatusFilterItems"
        :key="title"
        :active="modelValue === value"
        :title
        @click="modelValue = value"
      />
    </v-list>
  </v-menu>
</template>
