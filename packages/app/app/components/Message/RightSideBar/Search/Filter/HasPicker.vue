<script setup lang="ts">
import { FilterTypeHasIconMap } from "@/models/message/FilterTypeHasIconMap";
import { FilterTypeHas, FilterTypeHases } from "@esposter/db-schema";

const emit = defineEmits<{ select: [value: FilterTypeHas] }>();
</script>

<template>
  <v-list density="compact" py-0>
    <v-hover v-for="filterTypeHas in FilterTypeHases" :key="filterTypeHas" #default="{ isHovering, props }">
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
