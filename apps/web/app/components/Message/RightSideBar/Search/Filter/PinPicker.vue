<script setup lang="ts">
import type { SerializableValue } from "@esposter/azure";

const emit = defineEmits<{ select: [value: SerializableValue] }>();
const PIN_ITEMS = [
  { icon: "mdi-pin", label: "true", value: true },
  { icon: "mdi-pin-off", label: "false", value: false },
];
</script>

<template>
  <MessageRightSideBarSearchFilterOptionList :items="PIN_ITEMS" @select="emit('select', $event)" />
</template>
