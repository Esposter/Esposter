<script setup lang="ts">
import type { SerializableValue } from "@esposter/db";

const emit = defineEmits<{ select: [value: SerializableValue] }>();
const options = [true, false] as const;
</script>

<template>
  <v-list density="compact" py-0>
    <v-hover v-for="value in options" :key="String(value)" #default="{ isHovering, props }">
      <v-list-item :="props" @click="emit('select', value)">
        <v-list-item-title font-semibold>
          <v-icon :icon="value ? 'mdi-pin' : 'mdi-pin-off'" mr-2 />
          {{ value }}
        </v-list-item-title>
        <template #append>
          <v-icon :op="isHovering ? undefined : '0!'" icon="mdi-plus" />
        </template>
      </v-list-item>
    </v-hover>
  </v-list>
</template>
