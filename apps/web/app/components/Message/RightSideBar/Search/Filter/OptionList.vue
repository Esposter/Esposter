<script setup lang="ts">
import type { SerializableValue } from "@esposter/azure";

interface Props {
  items: { icon: string; label: string; value: SerializableValue }[];
}

const { items } = defineProps<Props>();
const emit = defineEmits<{ select: [value: SerializableValue] }>();
</script>

<template>
  <v-list density="compact" py-0>
    <v-hover v-for="{ icon, label, value } of items" :key="String(value)" #default="{ isHovering, props }">
      <v-list-item :="props" @click="emit('select', value)">
        <v-list-item-title font-semibold>
          <v-icon :icon mr-2 />
          {{ label }}
        </v-list-item-title>
        <template #append>
          <MessageRightSideBarSearchAddIcon :is-hovering />
        </template>
      </v-list-item>
    </v-hover>
  </v-list>
</template>
