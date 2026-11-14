<script setup lang="ts">
import { AUTHOR_TYPE_FILTER_OPTIONS } from "@/services/message/filter/constants";

const emit = defineEmits<{ select: [value: SerializableValue] }>();
</script>

<template>
  <MessageRightSideBarSearchFilterOptionList :items="AUTHOR_TYPE_FILTER_OPTIONS" @select="emit('select', $event)" />
</template>
