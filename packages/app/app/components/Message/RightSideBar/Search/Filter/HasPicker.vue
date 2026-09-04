<script setup lang="ts">
import type { SerializableValue } from "@esposter/azure";

import { FilterTypeHasIconMap } from "@/models/message/FilterTypeHasIconMap";
import { FilterTypeHases } from "@esposter/db-schema";

const emit = defineEmits<{ select: [value: SerializableValue] }>();
const HAS_ITEMS = FilterTypeHases.map((filterTypeHas) => ({
  icon: FilterTypeHasIconMap[filterTypeHas],
  label: filterTypeHas,
  value: filterTypeHas,
}));
</script>

<template>
  <MessageRightSideBarSearchFilterOptionList :items="HAS_ITEMS" @select="emit('select', $event)" />
</template>
