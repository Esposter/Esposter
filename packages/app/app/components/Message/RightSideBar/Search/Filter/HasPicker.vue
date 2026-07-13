<script setup lang="ts">
import type { SerializableValue } from "@esposter/db-schema";

import { FilterTypeHasIconMap } from "@/models/message/FilterTypeHasIconMap";
import { FilterTypeHases } from "@esposter/db-schema";

const emit = defineEmits<{ select: [value: SerializableValue] }>();
const items = FilterTypeHases.map((filterTypeHas) => ({
  icon: FilterTypeHasIconMap[filterTypeHas],
  label: filterTypeHas,
  value: filterTypeHas,
}));
</script>

<template>
  <MessageRightSideBarSearchFilterOptionList :items @select="emit('select', $event)" />
</template>
