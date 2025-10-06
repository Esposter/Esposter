<script setup lang="ts">
import type { SerializableValue } from "@esposter/shared";

import { dayjs } from "#shared/services/dayjs";

const emit = defineEmits<{ select: [value: SerializableValue] }>();
const { toJsDate } = useDate();
const date = ref<Date | null>(null);
</script>

<template>
  <v-date-picker
    v-model="date"
    :allowed-dates="
      (value) => {
        const date = toJsDate(value);
        return dayjs(date).isSameOrBefore(new Date(), 'day');
      }
    "
    show-adjacent-months
    @update:model-value="
      (value) => {
        if (!value) return;
        emit('select', value);
      }
    "
  />
</template>
