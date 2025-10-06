<script setup lang="ts">
import type { SerializableValue } from "@esposter/shared";

import { FilterTypeHas } from "#shared/models/message/FilterTypeHas";
import { FilterTypeHasIconMap } from "@/models/message/FilterTypeHasIconMap";

const emit = defineEmits<{ select: [value: SerializableValue] }>();
</script>

<template>
  <v-list density="compact" py-0>
    <v-hover
      v-for="filterTypeHas in Object.values(FilterTypeHas)"
      :key="filterTypeHas"
      #default="{ isHovering, props }"
    >
      <v-list-item :="props" @click="emit('select', filterTypeHas)">
        <v-list-item-title font-semibold>
          <v-icon :icon="FilterTypeHasIconMap[filterTypeHas]" mr-2 />
          {{ filterTypeHas }}
        </v-list-item-title>
        <template #append>
          <v-icon :op="isHovering ? undefined : '0!'" icon="mdi-plus" />
        </template>
      </v-list-item>
    </v-hover>
  </v-list>
</template>
