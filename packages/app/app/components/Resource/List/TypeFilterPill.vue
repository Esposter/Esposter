<script setup lang="ts">
import type { ResourceType } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceTypeListItems } from "@/services/resource/list/ResourceTypeListItems";

const modelValue = defineModel<ResourceType[]>({ required: true });
const label = computed(() =>
  modelValue.value.length > 0 ? modelValue.value.map((type) => ResourceDefinitionMap[type].title).join(", ") : "all",
);
const toggleType = (type: ResourceType) => {
  modelValue.value = modelValue.value.includes(type)
    ? modelValue.value.filter((selectedType) => selectedType !== type)
    : [...modelValue.value, type];
};
</script>

<template>
  <v-menu :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-chip :="menuProps">Type == {{ label }}</v-chip>
    </template>
    <v-list density="compact">
      <v-list-item
        v-for="{ icon, title, value } of ResourceTypeListItems"
        :key="value"
        :prepend-icon="icon"
        :title
        @click="toggleType(value)"
      >
        <template #append>
          <v-icon v-if="modelValue.includes(value)" icon="mdi-check" />
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
