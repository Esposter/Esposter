<script setup lang="ts">
import type { SerializableValue } from "@esposter/db-schema";

const emit = defineEmits<{ select: [value: SerializableValue] }>();
const items = [
  { icon: "mdi-pin", label: "true", value: true },
  { icon: "mdi-pin-off", label: "false", value: false },
];
</script>

<template>
  <MessageRightSideBarSearchFilterOptionList :items @select="emit('select', $event)" />
</template>
