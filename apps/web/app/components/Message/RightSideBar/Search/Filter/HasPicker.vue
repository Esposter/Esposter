<script setup lang="ts">
import type { SerializableValue } from "@esposter/azure";

import { HAS_FILTER_OPTIONS } from "@/services/message/filter/constants";

const emit = defineEmits<{ select: [value: SerializableValue] }>();
</script>

<template>
  <MessageRightSideBarSearchFilterOptionList :items="HAS_FILTER_OPTIONS" @select="emit('select', $event)" />
</template>
